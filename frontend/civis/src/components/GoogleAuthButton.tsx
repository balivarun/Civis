import { useEffect, useRef } from 'react'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleButtonText = 'signin_with' | 'signup_with'

type GoogleAuthButtonProps = {
  buttonText: GoogleButtonText
  disabled?: boolean
  onCredential: (credential: string) => void | Promise<void>
  onError: (message: string) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              shape?: 'pill' | 'rectangular'
              text?: GoogleButtonText
              width?: number
              logo_alignment?: 'left' | 'center'
            }
          ) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()
const GOOGLE_SCRIPT_ID = 'google-identity-services'

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google sign-in.')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google sign-in.'))
    document.head.appendChild(script)
  })
}

export default function GoogleAuthButton({
  buttonText,
  disabled = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    containerRef.current.innerHTML = ''

    if (disabled) {
      return
    }

    if (!GOOGLE_CLIENT_ID) {
      containerRef.current.textContent = 'Google sign-in is not configured.'
      containerRef.current.classList.add('google-auth-button--unavailable')
      return
    }

    containerRef.current.classList.remove('google-auth-button--unavailable')

    let cancelled = false

    void loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) {
          return
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (!response.credential) {
              onError('Google sign-in did not return a credential.')
              return
            }
            void onCredential(response.credential)
          },
        })

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: buttonText,
          width: Math.max(280, Math.floor(containerRef.current.getBoundingClientRect().width || 320)),
          logo_alignment: 'left',
        })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          onError(error instanceof Error ? error.message : 'Failed to load Google sign-in.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [buttonText, disabled, onCredential, onError])

  return <div ref={containerRef} className="google-auth-button" aria-hidden={disabled} />
}
