import type {FC} from 'react';
import React from 'react'
import { Layout, PageHeader } from 'vtex.styleguide'
import {defineMessages, useIntl} from 'react-intl'

import Details from './Details'

const messages = defineMessages({
  shippingList: { id: "admin/shipping-list.navigation.label" },
  shippingDetail: { id: "admin/order.details" }
});

const ShippingOrder: FC = props => {
  const intl = useIntl()
  const {formatMessage} = intl;
  return (
    <Layout fullWidth pageHeader={
      <PageHeader
        title={formatMessage({id: messages.shippingDetail.id})}
        linkLabel={formatMessage({id: messages.shippingList.id})}
        onLinkClick={() => {
          window.location.replace(`/admin/app/shipping/shipping-list`)
        }}
      />
    }>
      <Details data={props} intl={intl} />
    </Layout>
  )
}

export default ShippingOrder
