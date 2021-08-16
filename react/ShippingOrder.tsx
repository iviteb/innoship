import type {FC} from 'react';
import React from 'react'
import { Layout, PageHeader } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

import Details from './Details'

const ShippingOrder: FC = props => {
  const intl = useIntl()

  return (
    <Layout fullWidth pageHeader={<PageHeader title="Innoship" />}>
      <Details data={props} intl={intl} />
    </Layout>
  )
}

export default ShippingOrder
