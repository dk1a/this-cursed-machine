<script lang="ts">
  import { formatGwei } from "viem"
  import { walletNetwork, publicNetwork } from "@modules/network"
  import { accountKitModalOpen } from "@modules/ui/stores"
  import { store as accountKitStore } from "@latticexyz/account-kit/bundle"
  import { blockNumber } from "@modules/network"
  import type { AccountKitConnectReturn } from "@components/Spawn/account-kit-connect/types"

  let balance = "0"

  const openAccountModalPromise = new Promise<() => void>(resolve => {
    const { openAccountModal } = accountKitStore.getState()
    if (openAccountModal) return resolve(openAccountModal)
    const unsub = accountKitStore.subscribe(state => {
      if (state.openAccountModal) {
        unsub()
        resolve(state.openAccountModal)
      }
    })
  })

  export const connect = () =>
    openAccountModalPromise.then(openAccountModal => {
      accountKitModalOpen.set(true)
      openAccountModal()

      setTimeout(() => {
        document.querySelectorAll("iframe").forEach(item => {
          const input = item.contentWindow.document.body.querySelector("input")
          if (input) {
            input.focus()
          }
        })
      }, 100)
      return new Promise<AccountKitConnectReturn>((resolve, reject) => {
        const unsub = accountKitStore.subscribe(state => {
          // if (state.appAccountClient) {
          //   unsub()
          //   // Close the modal and resolve with appAccountClient
          //   state.closeAccountModal ? state.closeAccountModal() : null
          //   resolve({
          //     appAccountClient: state.appAccountClient,
          //     userAddress: state.userAddress,
          //   })
          // }

          if (state.accountModalOpen === false) {
            unsub()
            accountKitModalOpen.set(false)
            reject(new Error("Account modal closed before connecting."))
          }
        })
      })
    })

  const triggerConnect = async () => {
    connect()
  }

  const getBalance = async () => {
    if (!$walletNetwork?.walletClient?.account?.address) return "0"
    if (!$publicNetwork?.publicClient?.getBalance) return "0"

    const b = await $publicNetwork.publicClient.getBalance({
      address: $walletNetwork.walletClient.account.address,
    })

    return formatGwei(b)
  }

  const setBalance = async () => {
    balance = await getBalance()
  }

  $: if ($blockNumber) setBalance()
</script>

<div class="account-kit-balance">
  <span>
    <!-- {Math.round(balance)} gwei -->
    <!-- <button on:click={setBalance}>Balance</button> -->
    <button class="top-up" on:click={triggerConnect}>BURNER</button>
  </span>
</div>

<style lang="scss">
  .account-kit-balance {
    font-size: var(--font-size-small);

    button {
      // font-size: var(--font-size-small);
      font-family: var(--font-family);
    }
  }

  .top-up {
    background: var(--color-tutorial);
    color: var(--black);
    border: none;
    padding: 4px;
    cursor: pointer;
    font-size: var(--font-size-small);

    &:hover {
      background: var(--foreground);
    }
  }
</style>
