export default {
  translation: {
    header: {
      support: 'Support',
      feedback: 'Feedback',
      tos: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      logout: 'Logout',
    },
    errorPages: {
      takeMeHomeBtn: 'Take me Home',
      contactSupportBtn: 'Contact Support',
      invalidRoom: {
        title: 'You don’t have access to this room.',
        body: 'Please contact the room host for more details.',
        quoteText: '',
        altImgText: 'No access',
      },
      linkExpired: {
        title: 'Oops, this link is not valid anymore',
        body: 'Maybe the link has expired, or was revoked, or maybe you used this link already.',
        quoteText: '',
        altImgText: 'Link expired',
      },
      pageNotFound: {
        title: 'Lost in Space?',
        body: 'It seems like you landed on the wrong place. We suggest you back to home.',
        quoteText: '',
        altImgText: 'Page not found',
      },
      roomNotFound: {
        title: 'The Room is Gone',
        body: 'Seems like the room doesn’t exist anymore.',
        quoteText: '',
        altImgText: 'Room not found',
      },
      unexpected: {
        title: 'Uh oh!',
        body:
          'Our bad, something went wrong. We could show you some scary error message but you should just let us know :)',
        quoteText: '',
        altImgText: 'Unexpected',
      },
    },
    pages: {
      signin: {
        title: 'Sign in',
        email: {
          placeHolder: 'dorothy@emerald.so',
          label: 'Email Address',
        },
        submitButtonText: 'Sign In',
        imgAltText: 'sign in image',
      },
      confirmationView: {
        title: 'Check your email',
        bodyText: 'We sent a magic link to {{email}}',
        imgAltText: 'Check email image',
        snackSuccessMsg: 'We just sent you new magic link.',
        snackFailMsg: 'An error has occurred.',
      },
      dashboard: {
        feedbackItemBodyText: 'You will soon have the ability to create new rooms, rename rooms, and delete rooms.',
        feedbackItemLink: 'Give us feedback',
        roomsTitle: 'Your rooms',
        roomSummary: {
          joinRoomBtn: 'Join Room',
        },
      },
      finalizeAccount: {
        title: 'Finalize your account',
        body: 'Please finalize your account {{email}} to keep access to your room.',
        firstNamePlaceholder: 'Dorothy',
        fistNameLabel: 'First Name',
        lastNamePlaceholder: 'Gale',
        lastNameLabel: 'Last Name',
        tosCheckboxName: 'terms of service checkbox',
        tosCheckboxText: '',
        martketingCheckboxName: 'send me occasional emails checkbox',
        marketingCheckboxText: 'It’s ok to send me occasional emails',
        submitBtnText: 'Finalize my account',
        imgAltText: 'sign in',
        iAgreeText: 'I agree to the',
        termsOfService: 'Terms of Service',
      },
      claimConfirmationView: {
        title: 'Your room has been claimed',
        gotoRoomBtn: 'Go to my room',
        associationText: 'Your room {{roomName}} is now associated to your account {{email}}.',
        confirmationBody:
          'We are hard at work to allow you to invite other people to your room. For now, your guests can still access your room with the same room password as before.',
        mobileOptimizationNotice:
          'With is currently not optimized for mobile. We rather polish the experience before you can use it. Sorry for the inconvenience.',
        imgAltText: 'sign in',
      },
      room: {
        joinTitle: 'Joining {{roomName}}',
        analyticsDisclaimer:
          "We use analytics software to improve With. Please feel free to come back later, when we've made it optional.",
        screenNameLabel: 'Desired screen name',
        roomPasswordLabel: 'Room password',
        noVideo: 'No video',
      },
    },
    widgets: {
      link: {
        addWidgetTitle: 'Add a Link',
        publishedTitle: 'Link',
        titleLabel: 'Title',
        urlLabel: 'Url',
        addBtn: 'Add a link',
      },
      whiteboard: {
        title: 'Whiteboard',
      },
      youtube: {
        title: 'YouTube',
        urlLabel: 'YouTube Url',
        addBtn: 'Add a video',
      },
      stickyNote: {
        textPlaceholder: 'Note text',
        addBtn: 'Add note',
        addedBy: 'Added by {{author}}',
        addWidgetTitle: 'Add a Sticky Note',
        publishedTitle: 'Sticky Note',
      },
    },
    error: {
      messages: {
        provideValidEmail: 'Please provide a valid email.',
        provideValidUrl: 'Please provide a valid URL.',
        provideValidYoutubeUrl: 'Please provide a valid YouTube URL',
        mobileNotOptimized:
          "With is currently not optimized for mobile. We'd rather polish the experience before you can use it. Sorry for the inconvenience.",
        chromeOnIosRestrictions:
          'Due to technical restrictions on iOS, With cannot work in Chrome on iOS - please use Safari. Sorry for the inconvenience',
        noRoomPassword: 'You need a password to join this room',
        incorrectRoomPassword: 'The password you entered is incorrect',
        noRoomAccess: "You don't have access to this room. You'll need the password to get in.",
        unknownRoom: '',
        joinRoomInvalidScreenName: 'Please provide a valid screen name.',
        joinRoomUnknownFailure: 'Failed to join room - check your network connection.',
      },
      widgetsFallback: {
        title: 'Accessories error',
        msg:
          "An error occurred while setting up the room's accessories. Try refreshing the page and rejoining the room to fix this error.",
      },
      noteError: {
        title: 'A sidenote',
        btnText: 'Got it',
      },
    },
    features: {
      room: {
        viewportControlsToolTip: 'Arrow keys to pan, +/- to zoom',
      },
    },
  },
};
