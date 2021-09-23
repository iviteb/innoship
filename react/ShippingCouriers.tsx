import React, {Component} from 'react'
import {Button, Layout, PageHeader} from 'vtex.styleguide'
import styles from "./style.css";

import {defineMessages, FormattedMessage} from 'react-intl'

import {
  Box,
  Checkbox,
} from 'vtex.styleguide'
// import {requestHeaders} from "./utils/constants";

const messages = defineMessages({
  save: {id: 'admin/order.save'},
  awb: {id: 'admin.app.shipping-awb-couriers'},
  shippingList: { id: "admin/shipping-list.navigation.label" }
});

function FormattedMessageFixed(props) {
  return <FormattedMessage {...props} />
}

class ShippingCouriers extends Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = {
      couriers: [],
      checkedCouriers: {},
      saving: false,
      carriers: {},
      chunkedCarriers: []
    }
  }

  isChecked(id) {
    let { checkedCouriers } = this.state
    if (checkedCouriers.hasOwnProperty(id)) {
      return true
    }
    return false
  }

  toggleChecked(id) {
    let { checkedCouriers, couriers } = this.state
    if (checkedCouriers.hasOwnProperty(id)) {
      delete checkedCouriers[id]
    } else {
      let carriers = {}
      couriers.map(item => {
        carriers[item.courierId] = item.courier
      })
      checkedCouriers[id] = carriers[id]
    }

    this.setState({ checkedCouriers })
  }

  saveSettings() {
    this.setState({ saving: true })
    let { checkedCouriers } = this.state

    try {
      fetch(`/innoship/save-couriers`, {
          method: 'POST',
          body: JSON.stringify(checkedCouriers),
        })
        .then(res => res.json())
        .then(() => {
          this.setState({ saving: false })
        })
    } catch (err) {
      this.setState({ saving: false })
    }
  }

  async initCouriers() {
    await fetch('/innoship/get-couriers')
      .then(res => res.json())
      .then(json => {
        let sortedJson = json.sort((a, b) => (a.courier > b.courier ? 1 : -1));

        let i,j
        let chunkedArrays = [] as any
        const chunk = Math.ceil(sortedJson.length / 3)
        for (i = 0,j = sortedJson.length; i < j; i += chunk) {
          chunkedArrays.push(sortedJson.slice(i, i + chunk));
        }

        this.setState({ couriers: sortedJson, chunkedCarriers: chunkedArrays })
      })
    await fetch('/innoship/get-saved-couriers')
      .then(res => res.json())
      .then(json => {
        this.setState({ checkedCouriers: json })
      })
  }

  async componentDidMount() {
    await this.initCouriers()
  }

  public render() {
    const { chunkedCarriers } = this.state
    return (
      <Layout pageHeader={
        <PageHeader
          linkLabel={<FormattedMessageFixed id={messages.shippingList.id}/>}
          onLinkClick={() => {
            window.location.replace(`/admin/app/shipping/shipping-list`)
          }}
        />
      }>
        <div className={`pa6 ${styles.flex05}`}>
          <Box title={<FormattedMessageFixed id={messages.awb.id}/>}>
            <div className={`flex flex-row ${styles.flex06}`}>
              {chunkedCarriers.map((column, c) => {
                return (
                  <div key={c} className={`mb3 ${styles.flex03}`}>
                    {column.map((item, i) => {
                    return (
                      <div key={c+i} className="mb3">
                        <Checkbox
                          checked={this.isChecked(item.courierId)}
                          id={item.courierId}
                          label={item.courier}
                          name="default-checkbox-group"
                          onChange={() => this.toggleChecked(item.courierId)}
                          value="option-0"
                        />
                      </div>
                    )
                  })}
                </div>
                )
              })}
            </div>
            <div className="mb3">
              <Button
                size="small"
                variation="primary"
                isLoading={this.state.saving}
                onClick={() => this.saveSettings()}
              ><FormattedMessageFixed id={messages.save.id}/>
              </Button>
            </div>
          </Box>
        </div>
      </Layout>
    )
  }
}

export default ShippingCouriers
