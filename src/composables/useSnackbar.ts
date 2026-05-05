import { ref } from 'vue'

type SnackbarColor = 'success' | 'error' | 'info' | 'warning' | undefined

interface SnackbarState {
  visible: boolean
  message: string
  color: SnackbarColor
  timeout: number
}

const state = ref<SnackbarState>({
  visible: false,
  message: '',
  color: undefined,
  timeout: 3000,
})

export function useSnackbar() {
  function show(message: string, options?: { color?: SnackbarColor; timeout?: number }) {
    state.value = {
      visible: true,
      message,
      color: options?.color,
      timeout: options?.timeout ?? 3000,
    }
  }

  function success(message: string, timeout?: number) {
    show(message, { color: 'success', timeout })
  }

  function error(message: string, timeout?: number) {
    show(message, { color: 'error', timeout })
  }

  function dismiss() {
    state.value.visible = false
  }

  return { state, show, success, error, dismiss }
}
