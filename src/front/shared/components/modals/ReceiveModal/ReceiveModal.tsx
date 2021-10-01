import React, { Fragment }  from 'react'
import { withRouter } from 'react-router-dom'
import actions from 'redux/actions'
import { constants, externalConfig, getCurrencyKey, user } from 'helpers'
import erc20Like from 'common/erc20Like'
import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyles from './ReceiveModal.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import Copy from 'components/ui/Copy/Copy'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

const langPrefix = `ReceiveModal`
const langs = defineMessages({
  title: {
    id: 'Receive',
    defaultMessage: 'Receive',
  },
  needSaveMnemonicToContinue: {
    id: `${langPrefix}_YouNeedSaveMnemonic`,
    defaultMessage: `Вы должны сохранить 12 слов.`,
  },
  pleaseSaveMnemonicToContinue: {
    id: `${langPrefix}_SaveYourMnemonic`,
    defaultMessage: `Пожалуйста сохраните свою секретную фразу.`
  },
  buttonSaveMnemonic: {
    id: `${langPrefix}_ButtonSaveMnemonic`,
    defaultMessage: `Save`,
  },
  buttonCancel: {
    id: `${langPrefix}_ButtonCancel`,
    defaultMessage: `Cancel`,
  },
})

@withRouter
@cssModules({ ...styles, ...ownStyles }, { allowMultiple: true })
class ReceiveModal extends React.Component<any, any> {
  constructor(props) {
    super(props)
    const {
      data: {
        address,
        currency,
      },
    } = props

    let howToDeposit = ''
    if (externalConfig
      && externalConfig.erc20
      && externalConfig.erc20[currency.toLowerCase()]
      && externalConfig.erc20[currency.toLowerCase()].howToDeposit
    ) howToDeposit = externalConfig.erc20[currency.toLowerCase()].howToDeposit

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = (mnemonic === `-`)

    howToDeposit = howToDeposit.replace(/{userAddress}/g, address);

    const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)
    const isToken = erc20Like.isToken({ name: currency })
    const recieveUrl = (isToken ? '/token' : '') + `/${targetCurrency}/${address}/receive`
    
    props.history.push(recieveUrl)

    this.state = {
      step: (mnemonicSaved) ? 'receive' : 'saveMnemonic',
      howToDeposit,
    }
  }

  handleBeginSaveMnemonic = async () => {
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = (mnemonic === `-`)
        const step = (mnemonicSaved) ? 'receive' : 'saveMnemonicWords'

        this.setState({
          mnemonicSaved,
          step,
        })
      }
    })
  }

  handleClose = () => {
    const { name, history: { location: { pathname }, goBack } } = this.props

    if (pathname.includes('receive')) {
      goBack()
    }

    actions.modals.close(name)
  }

  render() {
    const {
      props: {
        intl: { locale },
        name,
        intl,
        data: {
          currency,
          address,
        },
      },
      state: {
        howToDeposit,
        step,
        mnemonicSaved,
      },
    } = this

    const externalExchangeLink = user.getExternalExchangeLink({ address, currency, locale })

    if (howToDeposit) {
      return (
        <Modal name={name} title={intl.formatMessage(langs.title)}>
          <div dangerouslySetInnerHTML={{ __html: howToDeposit }} />
        </Modal>
      )
    }

    return (
      <Modal name={name} title={intl.formatMessage(langs.title)}>
        <div styleName="content">
          {step === 'receive' && (
            <Fragment>
              <p style={{ fontSize: 25 }}>
                <FormattedMessage id="ReceiveModal50" defaultMessage="This is your {currency} address" values={{ currency: `${currency}` }} />
              </p>
              <Copy text={address}>
                <div styleName="qr">
                  <QR address={address} />

                  <p styleName="address">{address}</p>

                  <div styleName="sendBtnsWrapper">
                    <div styleName="actionBtn">
                      <Button big brand fill>
                        <FormattedMessage id="recieved67" defaultMessage="Copy to clipboard" />
                      </Button>
                    </div>
                    <div styleName="actionBtn">
                      <Button big gray fill onClick={this.handleClose}>
                        <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Copy>

              {externalExchangeLink && (
                <div styleName="fiatDepositRow">
                  <a href={externalExchangeLink} target="_blank" rel="noopener noreferrer">
                    <FormattedMessage
                      id="buyByCreditCard"
                      defaultMessage="buy using credit card"
                    />
                  </a>
                </div>
              )}
            </Fragment>
          )}
          {step === 'saveMnemonic' && (
            <Fragment>
              <div styleName="content-overlay">
                <p styleName="centerInfoBlock">
                  <strong>
                    <FormattedMessage {...langs.needSaveMnemonicToContinue} />
                  </strong>
                  <br />
                  <FormattedMessage {...langs.pleaseSaveMnemonicToContinue} />
                </p>
              </div>

              <div styleName="buttonsHolder buttonsHolder_2_buttons button-overlay">
                <Button blue onClick={this.handleBeginSaveMnemonic}>
                  <FormattedMessage {...langs.buttonSaveMnemonic} />
                </Button>
                <Button gray onClick={this.handleClose}>
                  <FormattedMessage {...langs.buttonCancel} />
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(ReceiveModal)