import React, { Component } from 'react'
import { Box, Button, DatePicker, Input, Modal } from 'vtex.styleguide'
import PropTypes from 'prop-types'

import settings from '../settings'
import styles from '../style.css'
import {defineMessages} from "react-intl";
import {requestHeaders} from "../utils/constants";

const messages = defineMessages({
  errorRequired: { id: "admin/order.error-required" },
  errorWhitespace: { id: "admin/order.error-whitespace"},
  errorSlashes: { id: "admin/order.error-slashes" },
  invoice: {id: "admin/order.status.invoice"},
  save: {id: 'admin/order.save'},
  close: {id: 'admin/order.close'},
  errors: {id: 'admin/order.errors'},
  invoiceInformation: {id: 'admin/order.invoice-information'},
  invoiceNumber: {id: 'admin/order.invoice-number'},
  invoiceUrl: {id: 'admin/order.invoice-url'},
  data: {id: 'admin/order.data'}
});

export default class InvoiceDetails extends Component<any, any> {
  static propTypes = {
    order: PropTypes.object,
    intl: PropTypes.object,
    logError: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      number: '',
      date: null,
      url: '',
      order: this.props.order,
      posted: false,
      isLoading: false,
      errors: {},
    };

    this.invoice = this.invoice.bind(this);
    this.validate = this.validate.bind(this);
    this.validForm = this.validForm.bind(this)
  }

  orderInit() {
    const { order } = this.state;

    if (!order.hasOwnProperty('error')) {
      if (order.status === settings.constants.invoiced) {
        const packageItem = order.packageAttachment.packages[0];

        this.setState({
          number: packageItem.invoiceNumber,
          url: packageItem.invoiceUrl,
          date: new Date(packageItem.issuanceDate),
        })
      }
    }
  }

  componentDidMount() {
    this.orderInit()
  }

  validForm() {
    const { number, date, url } = this.state;

    return !(number === '' ||
      url === '' ||
      date === null ||
      /\s/.test(number) ||
      number.indexOf('/') !== -1 ||
      number.indexOf('\\') !== -1 ||
      number.toLowerCase().indexOf('%2f') !== -1);


  }

  validate(value) {
    const { order } = this.state;
    const { formatMessage } = this.props.intl;


    if (
      (value === '' || value === null) &&
      order.status === settings.constants.handling &&
      this.state.posted
    ) {
      return formatMessage({id: messages.errorRequired.id})
    }

    if (/\s/.test(value) && typeof value !== 'object') {
      return formatMessage({id: messages.errorWhitespace.id})
    }

    return null
  }

  validateInvoiceNumber(value) {
    const { order } = this.state;
    const { formatMessage } = this.props.intl;

    if (
      (value === '' || value === null) &&
      order.status === settings.constants.handling &&
      this.state.posted
    ) {
      return formatMessage({id: messages.errorRequired.id})
    }

    if (
      value.indexOf('/') !== -1 ||
      value.indexOf('\\') !== -1 ||
      (value.toLowerCase().indexOf('%2f') !== -1 && typeof value !== 'object')
    ) {
      return formatMessage({id: messages.errorSlashes.id})
    }

    if (/\s/.test(value) && typeof value !== 'object') {
      return formatMessage({id: messages.errorWhitespace.id})
    }

    return null
  }

  async invoice(event) {
    this.setState({ posted: true });
    this.setState({ isLoading: true });
    if (!this.validForm()) {
      this.setState({ isLoading: false });

      return false
    }

    const { number, date, url, order } = this.state;

    if (order.status === settings.constants.handling) {
      const items = order.items.map(item => {
        return {
          id: item.productId,
          price: item.sellingPrice + item.tax,
          quantity: item.quantity,
        }
      });

      const data = {
        invoiceNumber: number,
        invoiceValue: order.value,
        issuanceDate: date.toISOString(),
        invoiceUrl: url,
        invoiceKey: '',
        trackingNumber: '',
        trackingUrl: '',
        courier: '',
        dispatchedDate: '',
        items,
      };

      try {
        const saveInvoiceRequest = await fetch(`/api/oms/pvt/orders/${order.orderId}/invoice`, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: requestHeaders,
        });
        const saveInvoice = await saveInvoiceRequest.json();

        this.setState({ invoice: saveInvoice }, () => {
          window.setTimeout(() => {
            window.location.reload()
          }, 2000)
        })

      } catch (err) {
        const errors = { innoship: [err] };

        this.props.logError(errors, 'innoship-errors');
        this.setState({ errors, modalOpen: true, isLoading: false })
      }
    }

    event.preventDefault();

    return null
  }

  async handleInvoice(event) {
    this.invoice(event)
  }

  public renderButton() {
    const { order } = this.state;
    const { formatMessage } = this.props.intl
    const handling = order.status === settings.constants.handling;

    if (!handling) {
      return null
    }

    return (
      <div className={`mb5 mt5 ${styles.textCenter}`}>
        <Button
          onClick={event => this.handleInvoice(event)}
          isLoading={this.state.isLoading}
          variation="primary"
          block
        >
          {formatMessage({id: messages.save.id})}
        </Button>
      </div>
    )
  }

  closeModal = () => {
    this.setState({ modalOpen: false, errors: {} })
  };

  public renderModal() {
    const { errors } = this.state;
    const {formatMessage} = this.props.intl;

    return (
      <Modal
        centered
        isOpen={this.state.modalOpen}
        onClose={this.closeModal}
        bottomBar={
          <div className="nowrap">
            <span className={`mr4`}>
              <Button variation="danger" size="small" onClick={this.closeModal}>{formatMessage({id: messages.close.id})}</Button>
            </span>
          </div>
        }
      >
        <div>
          <p className={`f3 f3-ns fw3 gray`}>{formatMessage({id: messages.errors.id})}</p>
          <ul>
            {Object.keys(errors).map(function(key) {
              return <li key={key}>{errors[key][0]}</li>
            })}
          </ul>
        </div>
      </Modal>
    )
  }

  public render() {
    const { order } = this.state;
    const handling = order.status === settings.constants.handling;
    const {formatMessage} = this.props.intl;
    const disabled = !handling;

    if (order.hasOwnProperty('error')) {
      return null
    }

    return (
      <div className={`pa6 ${styles.flex05}`}>
        <Box className={`${styles.flex05}`} title={`${formatMessage({id: messages.invoice.id})}`}>
          <div className={`mb5 mt5`}>
            <span>{formatMessage({id: messages.invoiceInformation.id})}</span>
          </div>

          <div className={`mb5`}>
            <Input
              id="name"
              dataAttributes={{ 'hj-white-list': true, test: 'string' }}
              label={formatMessage({id: messages.invoiceNumber.id})}
              onChange={event => this.setState({ number: event.target.value })}
              errorMessage={this.validateInvoiceNumber(this.state.number)}
              value={this.state.number}
              disabled={disabled}
            />
          </div>

          <div className={`mb5`}>
            <DatePicker
              id="date"
              label={formatMessage({id: messages.data.id})}
              value={this.state.date}
              onChange={date => this.setState({ date })}
              errorMessage={this.validate(this.state.date)}
              locale="en-GB"
              disabled={disabled}
            />
          </div>

          <div className={`mb5`}>
            <Input
              id="url"
              dataAttributes={{ 'hj-white-list': true, test: 'string' }}
              label={formatMessage({id: messages.invoiceUrl.id})}
              onChange={event => this.setState({ url: event.target.value })}
              errorMessage={this.validate(this.state.url)}
              value={this.state.url}
              disabled={disabled}
              minLength="1"
            />
          </div>
          {this.renderButton()}
        </Box>
        {this.renderModal()}
      </div>
    )
  }
}
