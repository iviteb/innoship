import type {FC} from 'react';
import React from 'react'
import {Layout, PageHeader, ToastProvider, withToast, ToastConsumer} from 'vtex.styleguide'
import {useIntl} from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import Details from './Details'

const ShippingOrder: FC = props => {
  const intl = useIntl()
  const { navigate } = useRuntime()

  return (
    <Layout fullWidth pageHeader={<PageHeader
      title="Details"
      linkLabel="Back to orders"
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
