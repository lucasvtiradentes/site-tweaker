export interface Site {
  domain: string
  enabled: boolean
}

export interface Headers {
  'content-security-policy': boolean
  'content-security-policy-report-only': boolean
  'x-webkit-csp': boolean
  'x-content-security-policy': boolean
  'x-content-security-policy-report-only': boolean
  'x-webkit-csp-report-only': boolean
  'report-to': boolean
  'reporting-endpoints': boolean
}

export interface Settings {
  enabled: boolean
  headers: Headers
  sites: Site[]
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: false,
  headers: {
    'content-security-policy': true,
    'content-security-policy-report-only': true,
    'x-webkit-csp': true,
    'x-content-security-policy': true,
    'x-content-security-policy-report-only': true,
    'x-webkit-csp-report-only': true,
    'report-to': true,
    'reporting-endpoints': true,
  },
  sites: [],
}

export type HeaderKey = keyof Headers
