import type {FC} from 'react';
import React from 'react'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import OrdersTable from './OrdersTable'

const ShippingList: FC = () => {
  const intl = useIntl()
  const { navigate } = useRuntime()

  return (
    <Layout fullWidth pageHeader={<PageHeader title="Innoship" />}>
      <PageBlock variation="full">
        <OrdersTable intl={intl} navigate={navigate} />
      </PageBlock>
    </Layout>
  )
}

export default ShippingList
