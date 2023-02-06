import {
    Checksum256,
    LoginContext,
    PermissionLevel,
    ResolvedSigningRequest,
    Signature,
    TransactContext,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginOptions,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
} from '@wharfkit/session'

import {receive} from '@greymass/buoy'
import WebSocket from 'isomorphic-ws'
import {createIdentityRequest} from './anchor'
import {CallbackPayload} from '@wharfkit/session'

export class WalletPluginAnchor implements WalletPlugin {
    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: WalletPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: false,
        // Should the user interface display a permission selector?
        requiresPermissionSelect: false,
    }
    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = {
        name: 'Anchor',
        description: '',
        logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMS40NCwgMCwgMCwgMS40NCwgLTguNTAxOTI1LCAtNTcuMDc0NTcpIiBzdHlsZT0iIj4KICAgIDx0aXRsZT5XaGl0ZTwvdGl0bGU+CiAgICA8Y2lyY2xlIGN4PSI5NC43OTMiIGN5PSIxMjguNTI0IiByPSI4MCIgZmlsbD0iI0ZCRkRGRiIvPgogICAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0gOTQuNzk5IDc4LjUyNCBDIDk3LjA5OCA3OC41MjQgOTkuMTk1IDc5LjgzNyAxMDAuMTk4IDgxLjkwNiBMIDEyNC4yMDQgMTMxLjQwNiBMIDEyNC43NDYgMTMyLjUyNCBMIDExMS40MDkgMTMyLjUyNCBMIDEwNy41MyAxMjQuNTI0IEwgODIuMDY5IDEyNC41MjQgTCA3OC4xODkgMTMyLjUyNCBMIDY0Ljg1MyAxMzIuNTI0IEwgNjUuMzk1IDEzMS40MDYgTCA4OS40MDEgODEuOTA2IEMgOTAuNDA0IDc5LjgzNyA5Mi41MDEgNzguNTI0IDk0Ljc5OSA3OC41MjQgWiBNIDg2LjkxOSAxMTQuNTI0IEwgMTAyLjY4IDExNC41MjQgTCA5NC43OTkgOTguMjc0IEwgODYuOTE5IDExNC41MjQgWiBNIDExMi43OTMgMTQ5LjUyNCBMIDEyNC43OTggMTQ5LjUyNCBDIDEyNC40MzcgMTY1LjY3NiAxMTEuMDY3IDE3OC41MjQgOTQuNzk5IDE3OC41MjQgQyA3OC41MzIgMTc4LjUyNCA2NS4xNjIgMTY1LjY3NiA2NC44MDEgMTQ5LjUyNCBMIDc2LjgwNiAxNDkuNTI0IEMgNzcuMDg3IDE1Ni44NzggODEuOTc0IDE2My4xNTUgODguNzkzIDE2NS41MiBMIDg4Ljc5MyAxNDEuNTI0IEMgODguNzkzIDEzOC4yMSA5MS40OCAxMzUuNTI0IDk0Ljc5MyAxMzUuNTI0IEMgOTguMTA3IDEzNS41MjQgMTAwLjc5MyAxMzguMjEgMTAwLjc5MyAxNDEuNTI0IEwgMTAwLjc5MyAxNjUuNTI0IEMgMTA3LjYyIDE2My4xNjIgMTEyLjUxMSAxNTYuODgzIDExMi43OTMgMTQ5LjUyNCBaIiBmaWxsPSIjMzY1MEEyIi8+CiAgPC9nPgo8L3N2Zz4=',
        homepage: 'https://greymass.com/anchor',
        download: 'https://greymass.com/anchor/download',
    }
    /**
     * Performs the wallet logic required to login and return the chain and permission level to use.
     *
     * @param options WalletPluginLoginOptions
     * @returns Promise<WalletPluginLoginResponse>
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async login(
        context: LoginContext,
        options: WalletPluginLoginOptions
    ): Promise<WalletPluginLoginResponse> {
        context.ui.status('Preparing request to Anchor...')

        const {callback, request} = await createIdentityRequest(context, options)

        context.ui.prompt({
            title: 'Login with Anchor',
            body: 'Scan the QR-code with Anchor on another device or use the button to open it here.',
            elements: [
                {
                    type: 'qr',
                    data: String(request),
                },
                {
                    type: 'button',
                    label: 'Open Anchor',
                    data: String(request),
                },
            ],
        })
        // context.ui.status('Use link... ' + String(request))

        // wait for callback or user cancel
        // let done = false
        const walletResponse = receive({...callback, WebSocket})
        // TODO: Implement cancel logic from the UI
        // const cancel = new Promise<never>((resolve, reject) => {
        //     t.onRequest(request, (reason) => {
        //         if (done) {
        //             // ignore any cancel calls once callbackResponse below has resolved
        //             return
        //         }
        //         const error = typeof reason === 'string' ? new CancelError(reason) : reason
        //         if (t.recoverError && t.recoverError(error, request) === true) {
        //             // transport was able to recover from the error
        //             return
        //         }
        //         walletResponse
        //         callback.cancel()
        //         reject(error)
        //     })
        // })
        const callbackResponse = await Promise.race([
            walletResponse,
            // cancel
        ])
        // done = true
        if (typeof callbackResponse.rejected === 'string') {
            throw new Error(callbackResponse.rejected)
        }
        const payload = JSON.parse(callbackResponse) as CallbackPayload
        if (payload.sa === undefined || payload.sp === undefined || payload.cid === undefined) {
            throw new Error('Invalid response from Anchor')
        }
        const signer = PermissionLevel.from({
            actor: payload.sa,
            permission: payload.sp,
        })
        return {
            chain: Checksum256.from(payload.cid),
            permissionLevel: signer,
        }
    }
    /**
     * Performs the wallet logic required to sign a transaction and return the signature.
     *
     * @param chain ChainDefinition
     * @param resolved ResolvedSigningRequest
     * @returns Promise<Signature>
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async sign(resolved: ResolvedSigningRequest, context: TransactContext): Promise<Signature> {
        // Example response...
        return Signature.from(
            'SIG_K1_KfqBXGdSRnVgZbAXyL9hEYbAvrZjcaxUCenD7Z3aX6yzf6MEyc4Cy3ywToD4j3SKkzSg7L1uvRUirEPHwAwrbg5c9z27Z3'
        )
    }
}
