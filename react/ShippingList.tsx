import type {FC} from 'react';
import React from 'react'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import {defineMessages, useIntl} from 'react-intl'

import OrdersTable from './OrdersTable'

const messages = defineMessages({
  shippingList: { id: "admin/shipping-list.navigation.label" }
});

const ShippingList: FC = () => {
  const intl = useIntl()
  const { navigate } = useRuntime()
  const {formatMessage} = intl;
  return (
    <Layout fullWidth pageHeader={<PageHeader title={formatMessage({id: messages.shippingList.id})} />}>
      <PageBlock variation="full">
        <OrdersTable intl={intl} navigate={navigate} />
      </PageBlock>
    </Layout>
  )
}

export default ShippingList
