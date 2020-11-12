export default {
  translation: {
    header: {
      support: 'Support',
      feedback: 'Feedback',
      tos: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      logout: 'Logout',
    },
    common: {
      emailInput: {
        placeHolder: 'dorothy@emerald.so',
        label: 'Email Address',
      },
      cancel: 'Cancel',
      error: 'Error',
      confirm: 'Got it',
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
        bodyText:
          "We sent a magic link to {{email}}<br/><br/> Click on the link in the email and you will be automatically logged in.<br/><br/>If you didn’t receive the email, you can <3>request a new link</3>. Don't forget to check your spam folder!",
        requestNewLinkText: 'request a new link',
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
        tosCheck: 'I agree to the <1>Terms of Service</1>',
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
      unsubscribe: {
        quoteText: '',
        title: 'You’ve been unsubscribed',
        body: 'If you have a moment, please let us know why you unsubscribed',
        button: 'Tell us why',
        imgAltText: 'Sad Blobby',
      },
      joinRoom: {
        title: 'Finalize your account',
        body: 'Please finalize your account {{email}} to join the room {{roomName}}.',
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
        tosCheck: 'I agree to the <1>Terms of Service</1>',
      },
    },
    widgets: {
      link: {
        name: 'Link',
        addWidgetTitle: 'Add a Link',
        publishedTitle: 'Link',
        titleLabel: 'Title',
        urlLabel: 'Url',
        addBtn: 'Add a link',
        errorInvalidUrl: 'Not a URL',
        quickActionTitle: 'Add a Link',
      },
      whiteboard: {
        name: 'Whiteboard',
        title: 'Whiteboard',
        doubleTapEraserToClear: 'Double tap Eraser to clear',
        export: 'Save whiteboard as an image',
      },
      youtube: {
        name: 'YouTube',
        title: 'YouTube',
        urlLabel: 'YouTube Url',
        addBtn: 'Add a video',
        quickActionTitle: 'Add a Video',
      },
      stickyNote: {
        name: 'Sticky Note',
        textPlaceholder: 'Note text',
        addBtn: 'Add note',
        addedBy: 'Added by {{author}}',
        addWidgetTitle: 'Add a Sticky Note',
        publishedTitle: 'Sticky Note',
        quickActionTitle: 'Add a Sticky Note',
        quickAddButton: 'Add another note',
      },
      screenShare: {
        name: 'Screen Share',
        title: "{{username}}'s screen",
        titleLocalUser: 'Your screen',
        titleEmpty: 'Share a screen',
        emptyMessage: 'Click the # above to start sharing',
      },
      unknown: {
        name: 'Accessory',
      },
      common: {
        close: 'Remove accessory',
        mutedForYou: 'Muted for you',
      },
    },
    error: {
      messages: {
        provideValidEmail: 'Please provide a valid email.',
        provideValidUrl: 'Please provide a valid URL.',
        provideValidYoutubeUrl: 'Please provide a valid YouTube URL',
        malformedUrl: 'Malformed URL. Please check to make sure URL has been properly copied from the email.',
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
        supportedFileTypes: '{{fileTypes}} are supported',
        invalidEmail: 'Invalid email.',
        catastrophicMediaError:
          'Something went very wrong while activating your media device. Try refreshing the page to see if that helps.',
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
      api: {
        // TODO: update error messages, right now we will just use the fallback messages
        // from the server and display those to the user
        // uncomment message and add your string to have these messages display
        TOO_MANY_OWNED_ROOMS: {
          //message: 'TOO_MANY_OWNED_ROOMS',
        },
        ALREADY_INVITED: {
          //message: 'ALREADY_INVITED',
        },
        UNKNOWN_ROOM: {
          //message: 'UNKNOWN_ROOM',
        },
        CLAIM_UNIQUENESS: {
          //message: 'CLAIM_UNIQUENESS',
        },
        CANT_INVITE_SELF: {
          //message: 'CANT_INVITE_SELF',
        },
        INVALID_ROOM_CLAIM: {
          //message: 'INVALID_ROOM_CLAIM',
        },
        UNAUTHORIZED_ROOM_ACCESSS: {
          //message: 'UNAUTHORIZED_ROOM_ACCESSS',
        },
        ALREADY_CLAIMED: {
          //message: 'ALREADY_CLAIMED',
        },
        INVALID_INVITE: {
          //message: 'INVALID_INVITE',
        },
        TOO_MANY_INVITES: {
          //message: 'TOO_MANY_INVITES',
        },
        ALREADY_REGISTERED: {
          //message: 'ALREADY_REGISTERED',
        },
        UNAUTHORIZED: {
          //message: 'UNAUTHORIZED',
        },
        ADMIN_ONLY_RESTRICTED: {
          //message: 'ADMIN_ONLY_RESTRICTED',
        },
        NO_SUCH_USER: {
          //message: 'NO_SUCH_USER',
        },
        UNEXPECTED: {
          message: 'Something unexpected has happened. Please try again later.',
        },
        INVALID_ROOM_PERMISSIONS: {},
        LINK_EXPIRED: {},
        PAGE_NOT_FOUND: {},
        ROOM_NOT_FOUND: {},
      },
      media: {
        audioPermissionDismissed:
          'If you want to share your voice, we\'ll need microphone access. Press the button to enable your mic, then choose "Allow"',
        audioPermissionDenied:
          "You've told your browser to never allow microphone access for With. Change that setting to start sharing your voice.",
        videoPermissionDismissed:
          'If you want to share your video, we\'ll need camera access. Press the button to enable your camera, then choose "Allow"',
        videoPermissionDenied:
          "You've told your browser to never allow camera access for With. Change that setting to start sharing your video.",
        screenSharePermissionDismissed:
          'If you want to share your screen, we\'ll need access. Press the button to share your screen, then choose "Allow"',
        screenSharePermissionDenied:
          "You've told your browser to never allow screen share access for With. Change that setting to start sharing your screen.",
      },
    },
    features: {
      room: {
        viewportControlsToolTip: 'Arrow keys to pan, +/- to zoom',
        customWallpaperLabel: 'Link to an image',
        wallpaperSet: 'New wallpaper set!',
        wallpaperSupportedFileTypes: 'JPG, PNG, WEBP, and GIF',
      },
      status: {
        placeholder: "What's your status?",
        emojiTitle: 'Pick an emoji',
        quickActionTitle: 'Set your status',
      },
      omnibar: {
        // TODO: update when we support more quick actions
        placeholder: 'Type or paste to add',
        label: 'Quick action bar',
      },
      roomMenu: {
        goToDashboard: 'Go to Dashboard',
        contactUs: 'Contact Us',
        voteOnFeatures: 'Vote on Features',
        roomWallpaper: 'Wallpaper',
        roomMembersTitle: 'Room members',
        addAndManage: 'Invite people',
        userSettings: 'User Settings',
        changelog: "What's new?",
      },
      mediaControls: {
        micToggle: 'Toggle voice',
        videoToggle: 'Toggle video',
        screenShareToggle: 'Toggle screen share',
      },
    },
    modals: {
      inviteUserModal: {
        title: 'Invite people to {{roomName}}',
        inviteBtn: 'Invite',
        noInvitesLeft: 'No invites left',
        invitesLeft: '{{count}} invite left',
        invitesLeft_plural: '{{count}} invites left',
        getStarted: 'Get started by inviting some people!',
        resendInvite: 'Resend Invite',
        deleteInvite: 'Cancel Invite',
        removeUser: 'Remove User',
        removeUserTitle: 'Remove {{user}} from {{room}}',
        removeUserBody:
          'Are you sure you want to remove {{user}} from the room {{room}}? The content this user has added in the room will remain in the room.',
        removeUserBtn: 'Remove {{user}}',
        invitedUser: 'Invited user',
        removeConfirmTitle: 'Remove {{user}} from {{room}}?',
        removeConfirmDesc:
          'Are you sure you want to remove {{user}} from the room {{room}}? The content this user has added in the room will remain in the room.',
        removeConfirmButton: 'Remove {{user}}',
        resendInviteSuccess: 'Invite re-sent',
      },
      wallpaperModal: {
        title: 'Wallpaper',
      },
      avModal: {
        title: 'Audio & Video',
      },
      onboardingModal: {
        nextBtnText: 'Next',
        PreviousText: 'Previous',
        finishText: 'Start using With',
        finishInvite: 'Start inviting people',
        step1: {
          title: 'Welcome',
          text:
            'Thanks for being an Alpha user.\n\nThere are still many things we need to build, and many things we need to learn.\n\nLet us show you around!',
          altText: 'Welcome img',
        },
        step2: {
          title: 'A spatial place',
          text:
            'In With, audio is based on proximity. You can drag your avatar and get closer to others to hear them clearly.\n\nYou can pan and zoom in the room using your mouse, keyboard, or trackpad.',
          altText: 'Spacial audio img',
        },
        step3: {
          title: 'Be present on your terms',
          text:
            'You can turn on your camera to engage heads-up, or choose a fun character to take the pressure off.\n\nSet a status to let others know what you’re up to, or hide in a corner to focus!',
          altText: 'AV img',
        },
        step4: {
          title: 'Accessorize',
          text:
            'Type or paste anything into the Omnibar and it will suggest the best accessories to add to the room.\n\nSticky notes, web links, whiteboards, and YouTube videos are currently available.',
          altText: 'Accessory img',
        },
      },
      userSettingsModal: {
        title: 'User settings',
        displayNameInput: {
          placeholder: 'Dorthy',
          label: 'Display Name',
          helperText: 'Ability to change your display name coming soon!',
        },
      },
      changelogModal: {
        title: "What's new?",
      },
    },
  },
};
