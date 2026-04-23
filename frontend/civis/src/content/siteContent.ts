export const siteSupport = {
  email: 'varunbali47@gmail.com',
  phone: '',
  phoneLabel: 'Support line',
}

export const infoPages = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    subtitle:
      'Civis collects the minimum information needed to help residents report civic issues, track complaint progress, and manage account access securely.',
    sections: [
      {
        title: 'Information we collect',
        body: [
          'We collect the account details you provide during sign up or sign in, such as your name, mobile number, email address, and authentication method.',
          'When you file a complaint, we store the category, title, description, location, landmark, optional image, priority, timeline updates, and timestamps required to track that complaint in the platform.',
        ],
      },
      {
        title: 'How Civis uses that information',
        body: [
          'Your information is used to create your account, authenticate access, display complaint history, support complaint review workflows, and show updates about the status of issues you submitted.',
          'Civis may also use configured providers such as OTP, email, or Google sign-in services to support authentication, but it does not sell your personal information or use complaint data for advertising.',
        ],
      },
      {
        title: 'Storage, access, and deletion',
        body: [
          'Complaint and account data are stored so residents and administrators can view complaint progress over time. Administrative access remains restricted to approved accounts.',
          'You can request account deletion from your profile page. When that happens, Civis removes your account, complaint records, and active sessions from the application database.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Terms of Use',
    subtitle:
      'Civis is intended for genuine civic issue reporting and responsible use by residents, administrators, and support teams.',
    sections: [
      {
        title: 'Acceptable use',
        body: [
          'You may use Civis to submit real civic complaints, monitor updates, and access the account features available to your role.',
          'You must not submit false reports, abusive content, impersonate other people, misuse admin capabilities, or attempt to interfere with the availability or security of the platform.',
        ],
      },
      {
        title: 'Account responsibility',
        body: [
          'You are responsible for the accuracy of the information you submit and for maintaining access to your login method, whether that is password, OTP, or Google sign-in.',
          'Admin access is limited to approved accounts and may be denied or removed if used outside its intended purpose.',
        ],
      },
      {
        title: 'Platform limitations',
        body: [
          'Civis helps organize complaints and provide visibility into their status, but it does not guarantee government response times, resolution timelines, or a specific outcome for every complaint filed.',
        ],
      },
    ],
  },
  contact: {
    eyebrow: 'Support',
    title: 'Contact Us',
    subtitle:
      'Use these channels if you need help with your account, accessibility support, or questions about how to use Civis.',
    sections: [
      {
        title: 'Primary contact channel',
        body: [
          'Email support: varunbali47@gmail.com',
          'If phone support is introduced later, it will be listed here and in the landing page footer.',
        ],
      },
      {
        title: 'What to include when contacting support',
        body: [
          'Share your complaint ID when possible, the page you were using, the browser or device involved, and a short description of the issue so the support team can investigate faster.',
        ],
      },
      {
        title: 'Support scope',
        body: [
          'Civis support can help with platform issues, access problems, and basic usage guidance. Complaint handling and resolution timelines still depend on the responsible civic or administrative teams.',
        ],
      },
    ],
  },
  accessibility: {
    eyebrow: 'Access',
    title: 'Accessibility',
    subtitle:
      'Civis is being improved to stay usable across desktop and mobile devices, with readable content, clear navigation, and responsive layouts.',
    sections: [
      {
        title: 'Current accessibility focus',
        body: [
          'The platform is being improved around responsive layouts, keyboard-friendly interactions, visible focus states, readable text contrast, and clearer page structure across public and authenticated screens.',
        ],
      },
      {
        title: 'Known limitations',
        body: [
          'Some advanced workflows and third-party integrations may still need more accessibility refinement. Civis continues improving those areas as the product evolves.',
        ],
      },
      {
        title: 'Reporting an accessibility issue',
        body: [
          'If you encounter an accessibility barrier, contact support with the page name, the action you were attempting, and the device or assistive technology involved so the issue can be reviewed quickly.',
        ],
      },
    ],
  },
} as const
