import type {FC} from 'react';
import React from 'react'
import { Layout, PageHeader, ToastProvider, withToast, ToastConsumer  } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

import Details from './Details'

const ShippingOrder: FC = props => {
  const intl = useIntl()

  return (
    <Layout fullWidth pageHeader={<PageHeader title="Details" />}>
      <ToastProvider positioning={'window'}>
        <ToastConsumer>
          { ({ showToast }) => (
            <Details data={props} intl={intl} showToast={showToast}/>
          )}
        </ToastConsumer>
      </ToastProvider>
    </Layout>
  )
}

export default withToast(ShippingOrder)
