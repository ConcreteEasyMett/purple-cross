import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

const purpleCrossLight = {
  dark: false,
  colors: {
    background: '#F7F7F9',
    surface: '#FFFFFF',
    'surface-variant': '#EFEFF3',
    'on-surface-variant': '#5A5A66',
    primary: '#5E35B1',
    'on-primary': '#FFFFFF',
    secondary: '#4A4A55',
    info: '#1E88E5',
    success: '#2E7D32',
    warning: '#B26A00',
    error: '#C62828',
  },
}

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'purpleCrossLight',
    themes: { purpleCrossLight },
  },
  defaults: {
    VBtn: { variant: 'flat' },
    VTextField: { variant: 'outlined', density: 'compact' },
    VSelect: { variant: 'outlined', density: 'compact' },
    VCombobox: { variant: 'outlined', density: 'compact' },
    VAutocomplete: { variant: 'outlined', density: 'compact' },
    VTextarea: { variant: 'outlined', density: 'compact' },
    VCard: { elevation: 1, rounded: 'md' },
    VAppBar: { elevation: 0, flat: true },
  },
})
