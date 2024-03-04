import type {FC} from 'react';
import React from 'react'
import {Layout, PageHeader, ToastProvider, withToast, ToastConsumer} from 'vtex.styleguide'
import {defineMessages,useIntl} from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import Details from './Details'

const messages = defineMessages({
  shippingList: { id: "admin/shipping-list.navigation.label" },
  shippingDetail: { id: "admin/order.details" }
});

const ShippingOrder: FC = props => {
  const intl = useIntl()
  const { navigate } = useRuntime()

  const {formatMessage} = intl;
  return (
    <Layout fullWidth pageHeader={<PageHeader
      title={formatMessage({id: messages.shippingDetail.id})}
      linkLabel={formatMessage({id: messages.shippingList.id})}
      onLinkClick={() => {
        navigate({to: `/admin/app/shipping/shipping-list`})
      }}
    />}>
      <ToastProvider positioning={'window'}>
        <ToastConsumer>
          {({showToast}) => (
            <Details data={props} intl={intl} showToast={showToast}/>
          )}
        </ToastConsumer>
      </ToastProvider>
    </Layout>
  )
}

export default withToast(ShippingOrder)
