import React, {Component} from 'react'
import {
  Table,
  ActionMenu,
  ButtonWithIcon,
  Tag,
  Spinner,
  Button,
} from 'vtex.styleguide'
import {FormattedCurrency} from 'vtex.format-currency'
import PropTypes from 'prop-types'
import {defineMessages, FormattedMessage} from 'react-intl'

import settings from '../settings'
import styles from '../style.css'
import {canceledStatus, requestHeaders} from "../utils/constants";

function FormattedMessageFixed(props) {
  return <FormattedMessage {...props} />
}

const messages = defineMessages({
  searchBy: {id: "admin/order.search-by"},
  requestAwb: {id: "admin/order.request-awb"},
  date: {id: 'admin/order.date'},
  shippingTotal: {id: 'admin/order.shipping-total'},
  shippingEstimate: {id: 'admin/order.shipping-estimate'},
  receiver: {id: 'admin/order.receiver'},
  payment: {id: 'admin/order.payment'},
  status: {id: 'admin/order.status'},
  awbStatus: {id: 'admin/order.awb-status'},
  waitingAuth: { id: 'admin/order.status.waiting-ffmt-authorization'},
  paymentPending: { id: 'admin/order.status.payment-pending'},
  paymentApproved: { id: 'admin/order.status.payment-approved'},
  readyForHandling: { id: 'admin/order.status.ready-for-handling'},
  handling: { id: 'admin/order.status.handling'},
  invoiced: { id: 'admin/order.status.invoiced'},
  canceled: { id: 'admin/order.status.canceled'},
  windowToCancel: { id: 'admin/order.status.window-to-cancel'},
  nextDays: { id: 'admin/order.next-days'},
  tomorrow: { id: 'admin/order.tomorrow'},
  today: { id: 'admin/order.today'},
  late: { id: 'admin/order.late'},
  offAutoUpdate: { id: 'admin/order.turn-off-auto-update'},
  onAutoUpdate: { id: 'admin/order.turn-on-auto-update'},
  clearFilters: {id: 'admin/order.clear-filters'},
  filterStatus: { id: 'admin/order.filter-status'},
  showRows: {id: 'admin/order.show-rows'},
  of: {id: 'admin/order.of'},
  actions: {id: 'admin/order.actions'},
  updateAwbStatus: {id: 'admin/order.update-awb-status'}
})
const initialState = {
  items: [],
  paging: {
    total: 0,
    currentPage: 1,
    perPage: 15,
    pages: 1,
  },
  currentItemFrom: 1,
  currentItemTo: 0,
  searchValue: '',
  itemsLength: 0,
  f_shippingEstimate: null,
  f_status: null,
  async: [],
  tableIsLoading: true,
  bulkActions: 0,
  bulkActionsProcessed: 0,
  awbAutoUpdateEnabled: false,
  awbAutoUpdateLoading: false,
  carriers: {}
};

class OrdersTable extends Component<any, any> {
  static propTypes = {
    intl: PropTypes.object,
  };

  constructor(props: any) {
    super(props);
    this.state = initialState;

    this.getItems = this.getItems.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.handlePrevClick = this.handlePrevClick.bind(this);
    this.handleInputSearchChange = this.handleInputSearchChange.bind(this);
    this.handleInputSearchSubmit = this.handleInputSearchSubmit.bind(this);
    this.handleInputSearchClear = this.handleInputSearchClear.bind(this);
    this.filterStatus = this.filterStatus.bind(this);
    this.filterShippingEstimate = this.filterShippingEstimate.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);

    this.updateAWB = this.updateAWB.bind(this);
    this.getAWBHistory = this.getAWBHistory.bind(this);
    this.updateAWBStatus = this.updateAWBStatus.bind(this);
    this.toggleAWBUpdate = this.toggleAWBUpdate.bind(this)
  }

  toggleAWBUpdate() {
    this.setState({awbAutoUpdateLoading: true});
    const {awbAutoUpdateEnabled} = this.state;

    if (awbAutoUpdateEnabled) {
      fetch('/innoship/scheduler', {method: 'DELETE'}).then(() => {
        this.setState({
          awbAutoUpdateEnabled: false,
          awbAutoUpdateLoading: false,
        })
      })
    } else {
      fetch('/innoship/scheduler', {method: 'POST'}).then(() => {
        this.setState({
          awbAutoUpdateEnabled: true,
          awbAutoUpdateLoading: false,
        })
      })
    }
  }

  async initAwbAutoUpdate() {
    this.setState({
      awbAutoUpdateEnabled: false,
      awbAutoUpdateLoading: true,
    });

    return fetch('/innoship/scheduler')
      .then(res => res.json())
      .then(json => {
        if (json.hasOwnProperty('response')) {
          this.setState({
            awbAutoUpdateEnabled: false,
            awbAutoUpdateLoading: false,
          })
        } else {
          this.setState({
            awbAutoUpdateEnabled: true,
            awbAutoUpdateLoading: false,
          })
        }
      })
  }

  updateAWBStatus(data) {
    if (
      data.length &&
      data[0].hasOwnProperty('history') &&
      data[0].hasOwnProperty('invoiceNumber')
    ) {
      const {history} = data[0];
      const {invoiceNumber} = data[0];
      const {orderId} = data[0];

      const events = history.map(event => {
        return {
          description: event.clientStatusDescription,
          date: event.eventDate,
        }
      });

      const payload = {
        events,
      };

      try {
        fetch(
          `/api/oms/pvt/orders/${orderId}/invoice/${invoiceNumber}/tracking`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: requestHeaders,
          }
        )
          .then(res => res.json())
          .then(() => {
            this.setState(
              prevState => {
                return {
                  bulkActionsProcessed: prevState.bulkActionsProcessed + 1,
                }
              },
              () => {
                if (
                  this.state.bulkActions === this.state.bulkActionsProcessed
                ) {
                  this.setState(
                    {bulkActions: 0, bulkActionsProcessed: 0},
                    () => this.getItems()
                  )
                }
              }
            )
          })
      } catch (err) {
        this.setState({posted: false})
      }
    } else {
      this.setState({posted: false})
    }
  }

  getAWBHistory(order) {
    const {courier, trackingNumber, invoiceNumber, orderId} = order;

    if (!courier || !trackingNumber || !invoiceNumber) {
      this.setState(
        prevState => {
          return {bulkActionsProcessed: prevState.bulkActionsProcessed + 1}
        },
        () => {
          if (this.state.bulkActions === this.state.bulkActionsProcessed) {
            this.setState({bulkActions: 0, bulkActionsProcessed: 0}, () =>
              this.getItems()
            )
          }
        }
      );

      return
    }

    const payload = {
      courier,
      awbList: [trackingNumber],
    };

    try {
      fetch('/innoship/request-awb-history', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          ...requestHeaders,
          'X-Vtex-Use-Https': 'true',
        },
      })
        .then(res => res.json())
        .then(json => {
          if (!json.hasOwnProperty('response')) {
            if (json.length) {
              json[0].invoiceNumber = invoiceNumber;
              json[0].orderId = orderId;
              this.updateAWBStatus(json)
            }
          }
        })
    } catch (err) {
      this.setState({posted: false})
    }
  }

  updateAWB(rows) {
    if (this.state.items.length === 0) {
      return
    }

    this.setState({
      bulkActions: rows.selectedRows.length,
      tableIsLoading: true,
      items: [],
    });

    rows.selectedRows.map(row => {
      this.getAWBHistory(row)
    })
  }

  handleResetFilters() {
    this.setState(
      {
        searchValue: '',
        f_shippingEstimate: null,
        f_status: null,
        currentItemFrom: 1,
      },
      this.getItems
    )
  }

  hasFiltersApplied() {
    const {f_status, f_shippingEstimate, searchValue} = this.state;

    return (
      f_status !== null || f_shippingEstimate !== null || searchValue !== ''
    )
  }

  handleNextClick() {
    const {paging} = this.state;

    paging.currentPage += 1;
    const currentItemFrom = this.state.currentItemFrom + paging.perPage;
    const currentItemTo = this.state.currentItemTo + paging.perPage;

    this.setState(
      {paging, currentItemFrom, currentItemTo},
      this.getItems
    )
  }

  handlePrevClick() {
    const {paging} = this.state;

    if (paging.currentPage === 0) return;
    paging.currentPage -= 1;
    const currentItemFrom = this.state.currentItemFrom - paging.perPage;
    const currentItemTo = this.state.currentItemTo - paging.perPage;

    this.setState(
      {paging, currentItemFrom, currentItemTo},
      this.getItems
    )
  }

  handleInputSearchChange(e) {
    this.setState({searchValue: e.target.value})
  }

  handleInputSearchClear() {
    this.setState({searchValue: ''}, this.getItems)
  }

  filterStatus(f_status) {
    const {paging} = this.state;

    paging.currentPage = 1;
    this.setState(
      {f_status, paging, currentItemFrom: 1},
      this.getItems
    )
  }

  filterShippingEstimate(f_shippingEstimate) {
    const {paging} = this.state;

    paging.currentPage = 1;
    this.setState(
      {f_shippingEstimate, paging, currentItemFrom: 1},
      this.getItems
    )
  }

  handleInputSearchSubmit(e) {
    const q = e && e.target && e.target.value;

    this.setState({searchValue: q}, this.getItems)
  }

  getItems() {
    this.setState({tableIsLoading: true});
    const {paging, f_shippingEstimate, f_status, searchValue, carriers} = this.state;
    let url = `/api/oms/pvt/orders?f_creationdate&page=${
      paging.currentPage
    }&per_page=${paging.perPage}&_=${Date.now()}`;

    if (f_shippingEstimate !== null) {
      url += `&f_shippingEstimate=${f_shippingEstimate}`
    }

    if (f_status !== null) {
      url += `&f_status=${f_status}`
    } else {
      url += `&f_status=ready-for-handling,handling,invoiced,canceled,waiting-ffmt-authorization,payment-pending,on-order-completed-ffm,order-accepted,window-to-cancel`
    }

    if (searchValue !== '') {
      url += `&q=${searchValue}`
    }

    try {
      fetch(url, {
        headers: requestHeaders,
      })
        .then(res => res.json())
        .then(json =>
          this.setState({
            items: json.list,
            paging: json.paging,
            currentItemTo: json.paging.perPage * json.paging.currentPage,
            tableIsLoading: false,
          })
        )
        .then(() => {
          const {items, async} = this.state;

          Object.keys(items).forEach(function (key) {
            fetch(`/api/oms/pvt/orders/${items[key].orderId}/?_=${Date.now()}`)
              .then(res => res.json())
              .then(json => {
                let notShipped = false;
                let shipping = 0;
                let awbStatus = 'n/a';
                let trackingNumber = null;
                let courier = null;
                let invoiceNumber = null;

                if (json.packageAttachment.packages.length) {
                  const packageItem = json.packageAttachment.packages[0];

                  if (
                    packageItem.invoiceNumber &&
                    !packageItem.trackingNumber
                  ) {
                    notShipped = true
                  }

                  invoiceNumber = packageItem.invoiceNumber ?? null
                  trackingNumber = packageItem.trackingNumber ?? null

                  if (packageItem.courier) {
                    // @ts-ignore
                    const reverseCourier = Object.assign({}, ...Object.entries(carriers).map(([a, b]) => ({[b]: a,})));

                    courier = reverseCourier[packageItem.courier]
                  }

                  if (
                    packageItem.courierStatus &&
                    packageItem.courierStatus.data.length
                  ) {
                    awbStatus = packageItem.courierStatus.data[0].description
                  }
                }

                if (json.totals.length) {
                  const ship = json.totals.filter(function (item) {
                    return item.id === 'Shipping'
                  });

                  if (ship.length) {
                    shipping = ship[0].value
                  }
                }

                const orderIndex = items.findIndex(function (item) {
                  return item.orderId == json.orderId
                });

                if (orderIndex !== null) {
                  items[orderIndex].shipping = shipping;
                  items[orderIndex].notShipped = notShipped;
                  items[orderIndex].awbStatus = awbStatus;
                  items[orderIndex].trackingNumber = trackingNumber;
                  items[orderIndex].courier = courier;
                  items[orderIndex].invoiceNumber = invoiceNumber
                }

                async.push({
                  orderId: json.orderId,
                  shipping,
                  notShipped,
                  awbStatus,
                })
              })
          });

          this.setState({async, items})
        })
    } catch (err) {
      this.setState({posted: false})
    }
  }

  async initCouriers() {
    await fetch('/innoship/get-couriers')
      .then(res => res.json())
      .then(json => {
        let carriers = {}
        json.map(item => {
          carriers[item.courierId] = item.courier
        })
        this.setState({ carriers })
      })
  }

  async componentDidMount() {
    this.getItems();
    await this.initAwbAutoUpdate()
    await this.initCouriers()
  }

  private getSchema() {
    const {formatMessage} = this.props.intl;
    return {
      properties: {
        orderId: {
          title: '#',
        },
        creationDate: {
          title: (formatMessage({id: messages.date.id})),
          cellRenderer: ({cellData}) => {
            return new Intl.DateTimeFormat('en-GB').format(new Date(cellData))
          },
        },
        totalValue: {
          title: (formatMessage({id: messages.shippingTotal.id})),
          cellRenderer: ({cellData, rowData}) => {
            const data = this.state.async.filter(function (item) {
              return item.orderId === rowData.orderId
            });
            const shipping = (data.length && data[0].shipping) ? data[0].shipping : 0;

            if (data.length) {
              return (
                <FormattedCurrency
                  key={cellData}
                  value={shipping / settings.constants.price_multiplier}
                />
              )
            }

            return <Spinner size={15}/>
          },
        },
        ShippingEstimatedDateMax: {
          title: (formatMessage({id: messages.shippingEstimate.id})),
          cellRenderer: ({cellData}) => {
            return !cellData ? 'n/a' : new Intl.DateTimeFormat('en-GB').format(new Date(cellData))
          },
        },
        clientName: {
          title: (formatMessage({id: messages.receiver.id})),
        },
        paymentNames: {
          title: (formatMessage({id: messages.payment.id})),
        },
        status: {
          title: (formatMessage({id: messages.status.id})),
          cellRenderer: ({cellData, rowData}) => {
            let tagColor = cellData === 'invoiced' ? 'blue' : 'green';
            let extraMessage;

            const data = this.state.async.filter(function (item) {
              return item.orderId === rowData.orderId
            });

            if (data.length) {
              if (data[0].notShipped && cellData !== canceledStatus) {
                tagColor = 'orange';
                extraMessage = ` - ${formatMessage({id: messages.requestAwb.id})}`
              }
            }

            const id = `admin/order.status.${cellData}`;

            if (data.length) {
              return (
                <Tag bgColor={tagColor} color="#fff">
                  <FormattedMessageFixed id={id}/>
                  {extraMessage}
                </Tag>
              )
            }

            return <Spinner size={15}/>
          },
        },
        awbStatus: {
          title: (formatMessage({id: messages.awbStatus.id})),
          cellRenderer: ({cellData, rowData}) => {
            const data = this.state.async.filter(function (item) {
              return item.orderId === rowData.orderId
            });
            const message = (data.length && data[0].awbStatus) ? data[0].awbStatus : null

            return message ? (<Tag key={cellData} bgColor="blue" color="#fff">{message}</Tag>) : (<Spinner size={15}/>)

          },
        },
      },
    }
  }

  public getFilterStatusOptions() {
    const {formatMessage} = this.props.intl;
    return [
      {
        label: formatMessage({id: messages.waitingAuth.id}),
        onClick: () => this.filterStatus('waiting-ffmt-authorization,on-order-completed-ffm,order-accepted'),
      },
      {
        label: formatMessage({id: messages.paymentPending.id}),
        onClick: () => this.filterStatus('payment-pending'),
      },
      {
        label: formatMessage({id: messages.paymentApproved.id}),
        onClick: () => this.filterStatus('payment-approved'),
      },
      {
        label: formatMessage({id: messages.readyForHandling.id}),
        onClick: () => this.filterStatus('ready-for-handling'),
      },
      {
        label: formatMessage({id: messages.handling.id}),
        onClick: () => this.filterStatus('handling'),
      },
      {
        label: formatMessage({id: messages.invoiced.id}),
        onClick: () => this.filterStatus('invoiced'),
      },
      {
        label: formatMessage({id: messages.canceled.id}),
        onClick: () => this.filterStatus('canceled'),
      },
      {
        label: formatMessage({id: messages.windowToCancel.id}),
        onClick: () => this.filterStatus('window-to-cancel'),
      },
    ]
  }

  public getShippingEstimateOptions(){
    const {formatMessage} = this.props.intl
    return [
      {
        label: formatMessage({id: messages.nextDays.id}),
        onClick: () => this.filterShippingEstimate('7.days'),
      },
      {
        label: formatMessage({id: messages.tomorrow.id}),
        onClick: () => this.filterShippingEstimate('1.days'),
      },
      {
        label: formatMessage({id: messages.today.id}),
        onClick: () => this.filterShippingEstimate('0.days'),
      },
      {
        label: formatMessage({id: messages.late.id}),
        onClick: () => this.filterShippingEstimate('-1.days'),
      },
    ]
  }

  public render() {
    const {paging, awbAutoUpdateEnabled, awbAutoUpdateLoading} = this.state;
    const {formatMessage} = this.props.intl;

    return (
      <div>
        <div className={`flex justify-end`}>
          <div className={`ma3`}>
            <Button
              size="small"
              variation="primary"
              href="/admin/shipping/couriers" target="_blank"
            >AWB Carriers Settings
            </Button>
          </div>
          <div className={`ma3`}>
            <Button
              size="small"
              variation={awbAutoUpdateEnabled ? 'primary' : 'danger'}
              isLoading={awbAutoUpdateLoading}
              onClick={() => this.toggleAWBUpdate()}
            >
              {awbAutoUpdateEnabled
                ? formatMessage({id: messages.offAutoUpdate.id})
                : formatMessage({id: messages.onAutoUpdate.id})}
            </Button>
          </div>
        </div>
        <div className={`flex items-center ${styles.tableHeaderButtons}`}>
          {this.hasFiltersApplied() && (
              <div className={`ma3`}>
                <ButtonWithIcon
                  variation="secondary"
                  size="small"
                  onClick={() => this.handleResetFilters()}
                >
                  {formatMessage({id: messages.clearFilters.id})}
                </ButtonWithIcon>
              </div>
          )}
          <div className={`ma3`}>
            <ActionMenu
              label={formatMessage({id: messages.filterStatus.id})}
              align="right"
              buttonProps={{
                variation: 'secondary',
                size: 'small',
              }}
              options={this.getFilterStatusOptions()}
            />
          </div>
          <div className={`ma3`}>
            <ActionMenu
              label={formatMessage({id: messages.shippingEstimate.id})}
              align="right"
              buttonProps={{
                variation: 'secondary',
                size: 'small',
              }}
              options={this.getShippingEstimateOptions()}
            />
          </div>
        </div>


        <Table
          fullWidth
          loading={this.state.tableIsLoading}
          items={this.state.items}
          schema={this.getSchema()}
          onRowClick={({rowData}) => {
            window.open(`/admin/shipping/order/${rowData.orderId}`)
          }}
          toolbar={{
            inputSearch: {
              value: this.state.searchValue,
              placeholder: formatMessage({id: messages.searchBy.id}),
              onChange: this.handleInputSearchChange,
              onClear: this.handleInputSearchClear,
              onSubmit: this.handleInputSearchSubmit,
            },
          }}
          pagination={{
            onNextClick: this.handleNextClick,
            onPrevClick: this.handlePrevClick,
            textShowRows: (formatMessage({id: messages.showRows.id})),
            textOf: (formatMessage({id: messages.of.id})),
            currentItemFrom: this.state.currentItemFrom,
            currentItemTo: this.state.currentItemTo,
            totalItems: paging.total,
          }}
          bulkActions={{
            texts: {
              secondaryActionsLabel: (formatMessage({id: messages.actions.id})),
              rowsSelected: qty => (
                <React.Fragment>Selected rows: {qty}</React.Fragment>
              ),
            },
            main: {
              label: (formatMessage({id: messages.updateAwbStatus.id})),
              handleCallback: params => this.updateAWB(params),
            },
          }}
        />
      </div>
    )
  }
}

export default OrdersTable
