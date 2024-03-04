import React, {Component} from 'react'
import {
  Table,
  ActionMenu,
  Tag,
  Spinner,
  Checkbox,
  Toggle,
  Button
} from 'vtex.styleguide'
import {FormattedCurrency} from 'vtex.format-currency'
import PropTypes from 'prop-types'
import {defineMessages, FormattedMessage} from 'react-intl'

import settings from '../settings'
import styles from '../style.css'
import {allFilterStatuses, allShippingEstimates, canceledStatus, requestHeaders} from "../utils/constants";

function FormattedMessageFixed(props) {
  return <FormattedMessage {...props} />
}

const messages = defineMessages({
  idColumn: {id: "admin/order.idColumn"},
  searchBy: {id: "admin/order.search-by"},
  requestAwb: {id: "admin/order.request-awb"},
  date: {id: 'admin/order.date'},
  shippingTotal: {id: 'admin/order.shipping-total'},
  shippingEstimate: {id: 'admin/order.shipping-estimate'},
  receiver: {id: 'admin/order.receiver'},
  payment: {id: 'admin/order.payment'},
  status: {id: 'admin/order.status'},
  awbStatus: {id: 'admin/order.awb-status'},
  waitingForAuthentication: {id: 'admin/order.status.waiting-ffmt-authorization'},
  paymentPending: {id: 'admin/order.status.payment-pending'},
  paymentApproved: {id: 'admin/order.status.payment-approved'},
  readyForHandling: {id: 'admin/order.status.ready-for-handling'},
  handling: {id: 'admin/order.status.handling'},
  invoiced: {id: 'admin/order.status.invoiced'},
  canceled: {id: 'admin/order.status.canceled'},
  windowToCancel: {id: 'admin/order.status.window-to-cancel'},
  nextDays: {id: 'admin/order.next-days'},
  tomorrow: {id: 'admin/order.tomorrow'},
  today: {id: 'admin/order.today'},
  late: {id: 'admin/order.late'},
  offAutoUpdate: {id: 'admin/order.turn-off-auto-update'},
  onAutoUpdate: {id: 'admin/order.turn-on-auto-update'},
  clearFilters: {id: 'admin/order.clear-filters'},
  filterStatus: {id: 'admin/order.filter-status'},
  showRows: {id: 'admin/order.show-rows'},
  of: {id: 'admin/order.of'},
  actions: {id: 'admin/order.actions'},
  updateAwbStatus: {id: 'admin/order.update-awb-status'},
  updateAwbCouriers: {id: 'admin/app.shipping-awb-couriers-settings'},
  noData: {id: 'admin/order.no-data'},
  allFilters: {id: 'admin/order.filters-all'},
  noneFilters: {id: 'admin/order.filters-none'},
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
  carriers: {},
  filterStatements: [],
};

class OrdersTable extends Component<any, any> {
  static propTypes = {
    intl: PropTypes.object,
    navigate: PropTypes.func
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
    this.handleFiltersChange = this.handleFiltersChange.bind(this)
    this.orderStatusSelectorObject = this.orderStatusSelectorObject.bind(this)
    this.shippingEstimateSelectorObject = this.shippingEstimateSelectorObject.bind(this)
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
        this.setState({
          awbAutoUpdateEnabled: !json.hasOwnProperty('response'),
          awbAutoUpdateLoading: false,
        })
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

  async getAWBHistory(order) {
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

  async updateAWB(rows) {
    if (this.state.items.length === 0) {
      return
    }

    this.setState({
      bulkActions: rows.selectedRows.length,
      tableIsLoading: true,
      items: [],
    });

    await Promise.all(rows.selectedRows.map(async row => {
      await this.getAWBHistory(row)
    }))
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
          title: (formatMessage({id: messages.idColumn.id})),
          width: 200,
        },
        creationDate: {
          title: (formatMessage({id: messages.date.id})),
          cellRenderer: ({cellData}) => {
            return new Intl.DateTimeFormat('en-GB').format(new Date(cellData))
          },
        },
        totalValue: {
          title: (formatMessage({id: messages.shippingTotal.id})),
          width: 150,
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
            return !cellData ? (<Tag key={cellData} bgColor="gray"
                                     color="#fff">{formatMessage({id: messages.noData.id})}</Tag>) : new Intl.DateTimeFormat('en-GB').format(new Date(cellData))
          },
          width: 200
        },
        clientName: {
          title: (formatMessage({id: messages.receiver.id})),
          width: 250
        },
        paymentNames: {
          title: (formatMessage({id: messages.payment.id})),
        },
        status: {
          title: (formatMessage({id: messages.status.id})),
          width: 200,
          cellRenderer: ({cellData, rowData}) => {
            let tagColor = 'green';
            if (cellData === 'invoiced') {
              tagColor = 'blue';
            } else if (cellData === 'ready-for-handling') {
              tagColor = '#00b300';
            } else if (cellData === 'payment-pending') {
              tagColor = '#b3b3b3'
            } else if (cellData === 'canceled') {
              tagColor = '#ff0000'
            } else if (cellData === 'payment-approved') {
              tagColor = '#1aa3ff'
            }
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
          width: 200,
          cellRenderer: ({cellData, rowData}) => {
            const data = this.state.async.filter(function (item) {
              return item.orderId === rowData.orderId
            });
            const message = (data.length && data[0].awbStatus) ? data[0].awbStatus : null
            if (message) {
              return message !== 'n/a' ?
                (<Tag key={cellData} bgColor="blue" color="#fff">{message}</Tag>) :
                <Tag key={cellData} bgColor="gray" color="#fff">{formatMessage({id: messages.noData.id})}</Tag>
            }
            return <Spinner size={15}/>
          },
        },
      },
    }
  }

  public handleFiltersChange(statements = []) {

    const {paging} = this.state;

    let stateStatuses = '';
    let stateEstimateShipping = '';
    paging.currentPage = 1;

    statements.forEach((st: any) => {

      if (!st || !st.object) return
      const { subject, object } = st
      switch (subject) {
        case 'orderStatus':
          if (!object) return

          if(Object.keys(object).length) {
            const selectedStatuses : any[] = []
            Object.keys(object).map(function(key) {
              if(object[key]) {
                selectedStatuses.push(allFilterStatuses[key])
              }

            });
            stateStatuses = selectedStatuses.join(',')
          }
          break

        case 'estimateShipping':
          if (!object) return
          if(Object.keys(object).length) {
            const selectedOptions : any[] = []
            Object.keys(object).map(function(key) {
              if(object[key]) {
                selectedOptions.push(allShippingEstimates[key])
              }

            });
            stateEstimateShipping = selectedOptions.join(',')
          }
          break
      }
    });
    this.setState({
      filterStatements: statements,
      f_status: stateStatuses,
      f_shippingEstimate: stateEstimateShipping,
      paging,
      currentItemFrom: 1
    }, this.getItems)
  }

  public orderStatusSelectorObject({
                               values,
                               onChangeObjectCallback,
                             }) {
    const {formatMessage} = this.props.intl;
    const initialValue = {
      waitingForAuthentication: true,
      paymentPending: true,
      paymentApproved: true,
      handling: true,
      readyForHandling: true,
      invoiced: true,
      canceled: true,
      windowToCancel: true,
      ...(values || {}),
    }
    const toggleValueByKey = key => {
      return {
        ...(values || initialValue),
        [key]: values ? !values[key] : false,
      }
    }

    return (
      <div>
        {Object.keys(initialValue).map((opt, index) => {
          return (
            <div className="mb3" key={`class-statment-object-${opt}-${index}`}>
              <Checkbox
                checked={values ? values[opt] : initialValue[opt]}
                label={`${formatMessage({id: messages[opt].id})}`}
                name="default-checkbox-group"
                onChange={() => {
                  const newValue = toggleValueByKey(`${opt}`)
                  const newValueKeys = Object.keys(newValue)
                  const isEmptyFilter = !newValueKeys.some(
                    key => !newValue[key]
                  )
                  onChangeObjectCallback(isEmptyFilter ? null : newValue)
                }}
                value={allFilterStatuses[opt]}
              />
            </div>
          )
        })}
      </div>
    )
  }

  public shippingEstimateSelectorObject({
                                          values,
                                          onChangeObjectCallback,
                                        }) {
    const {formatMessage} = this.props.intl;
    const initialValue = {
      nextDays: false,
      tomorrow: false,
      today: false,
      late: false,
    }
    const toggleValueByKey = key => {
      return {
        ...initialValue,
        [key]: true,
      }
    }
    return (
      <div>
        {Object.keys(initialValue).map((opt, index) => {
          return (
            <div className="mb3" key={`class-statment-object-${opt}-${index}`}>
              <Checkbox
                checked={values ? values[opt] : initialValue[opt]}
                label={`${formatMessage({id: messages[opt].id})}`}
                name="default-checkbox-group"
                onChange={() => {
                  const newValue = toggleValueByKey(`${opt}`)

                  const newValueKeys = Object.keys(newValue)
                  const isEmptyFilter = !newValueKeys.some(
                    key => !newValue[key]
                  )
                  onChangeObjectCallback(isEmptyFilter ? null : newValue)
                }}
                value={allShippingEstimates[opt]}
              />
            </div>
          )
        })}
      </div>
    )
  }

  public render() {
    const {paging, awbAutoUpdateEnabled} = this.state;
    const {formatMessage} = this.props.intl;

    return (
      <div>
        <div className={`flex justify-end`}>
          <div className={`ma3`}>
            <Toggle
              label={awbAutoUpdateEnabled ? formatMessage({id: messages.offAutoUpdate.id}) : formatMessage({id: messages.onAutoUpdate.id})}
              checked={awbAutoUpdateEnabled}
              onChange={() => {
                this.toggleAWBUpdate()
              }}
            />
          </div>
          <div className={`ma3`}>
            <Button variation="primary" size="small" onClick={() => {this.props.navigate({to: `/admin/app/shipping/couriers`})}}>
              {formatMessage({id: messages.updateAwbCouriers.id})}
            </Button>
          </div>
        </div>
        <Table
          fullWidth
          loading={this.state.tableIsLoading}
          items={this.state.items}
          schema={this.getSchema()}
          onRowClick={({rowData}) => {
            this.props.navigate({to: `/admin/app/shipping/order/${rowData.orderId}`})
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
              handleCallback: params => {this.updateAWB(params)},
            },
          }}
          filters={{
            alwaysVisibleFilters: ['orderStatus', 'estimateShipping'],
            statements: this.state.filterStatements,
            onChangeStatements: this.handleFiltersChange,
            clearAllFiltersButtonLabel: formatMessage({id: messages.clearFilters.id}),
            collapseLeft: true,
            options: {
              orderStatus: {
                label: formatMessage({id: messages.filterStatus.id}),
                renderFilterLabel: st => {
                  if (!st || !st.object) {
                    return formatMessage({id: messages.allFilters.id})
                  }
                  const keys:any = st.object ? Object.keys(st.object) : {}
                  const isAllTrue = !keys.some(key => !st.object[key])
                  const isAllFalse = !keys.some(key => st.object[key])
                  const trueKeys = keys.filter(key => st.object[key])
                  let trueKeysLabel = ''
                  trueKeys.forEach((key, index) => {
                    trueKeysLabel += `${key}${
                      index === trueKeys.length - 1 ? '' : ', '
                    }`
                  })
                  return `${isAllTrue ? formatMessage({id: messages.allFilters.id}) : isAllFalse ? formatMessage({id: messages.noneFilters.id}) : `${trueKeysLabel}`}`
                },
                verbs: [
                  {
                    label: formatMessage({id: messages.filterStatus.id}),
                    value: 'includes',
                    object: {
                      renderFn: this.orderStatusSelectorObject,
                      extraParams: {},
                    },
                  },
                ],
              },
              estimateShipping: {
                label: formatMessage({id: messages.shippingEstimate.id}),
                renderFilterLabel: st => {
                  if (!st || !st.object) {
                    return formatMessage({id: messages.allFilters.id})
                  }
                  const keys:any = st.object ? Object.keys(st.object) : {}
                  const isAllTrue = !keys.some(key => !st.object[key])
                  const isAllFalse = !keys.some(key => st.object[key])
                  const trueKeys = keys.filter(key => st.object[key])
                  let trueKeysLabel = ''
                  trueKeys.forEach((key, index) => {
                    trueKeysLabel += `${key}${
                      index === trueKeys.length - 1 ? '' : ', '
                    }`
                  })
                  return `${isAllTrue ? formatMessage({id: messages.allFilters.id}) : isAllFalse ? formatMessage({id: messages.noneFilters.id}) : `${trueKeysLabel}`}`
                },
                verbs: [
                  {
                    label: formatMessage({id: messages.shippingEstimate.id}),
                    value: 'includes',
                    object: {
                      renderFn: this.shippingEstimateSelectorObject,
                      extraParams: {},
                    },
                  },
                ],
              },
            },
          }}
        />
      </div>
    )
  }
}

export default OrdersTable
