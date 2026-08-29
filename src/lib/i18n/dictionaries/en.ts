import type { Dictionary } from './ru';

export const en: Dictionary = {
  common: {
    brand: 'Qonys',
    tagline: 'shared housing in Kazakhstan',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    send: 'Send',
    sending: 'Sending…',
    loading: 'Loading…',
    close: 'Close',
    perMonth: 'per month',
    month: 'mo',
    now: 'just now',
    yesterday: 'yesterday',
    minutesAgo: 'min ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    error: 'Something went wrong. Please try again',
    language: 'Language'
  },
  nav: {
    feed: 'Listings',
    pricing: 'Pricing',
    safety: 'Safety',
    about: 'About',
    rules: 'Rules',
    cabinet: 'Account',
    admin: 'Admin',
    chat: 'Messages',
    support: 'Support',
    login: 'Sign in',
    logout: 'Sign out',
    post: 'Post a listing',
    menu: 'Menu'
  },
  home: {
    eyebrow: 'Astana · Almaty · Shymkent · Karaganda',
    title: 'Find a room and a roommate in a single day.',
    subtitle:
      'Qonys connects people looking for a room with people looking for a roommate. Clear profiles, filters by district and habits, built-in chat — no endless scrolling through group chats.',
    ctaPost: 'Post a listing',
    ctaFeed: 'Browse listings',
    statListings: 'active profiles',
    statDistricts: 'districts across four cities',
    statReply: 'to the first reply',
    howTitle: 'How it works',
    step1Title: 'Fill in your profile',
    step1Text: 'Say who you are looking for: district, budget, habits. The clearer it is, the fewer dead-end chats.',
    step2Title: 'Browse matches',
    step2Text: 'The feed narrows profiles to your criteria. You see occupation, schedule and habits.',
    step3Title: 'Message inside Qonys',
    step3Text: 'Chat lives in the product. You unlock the phone number yourself, only when you want to.'
  },
  feed: {
    title: 'Listings',
    found: (n: number) => `${n} listings match your filters`,
    empty: 'Nothing matches these filters yet',
    emptyHint: 'Try widening the budget or clearing the district filter',
    list: 'List',
    map: 'Map'
  },
  filters: {
    all: 'All',
    offer: 'Offering a room',
    seek: 'Looking for a roommate',
    city: 'City',
    district: 'District',
    anyDistrict: 'Any district',
    housing: 'Housing type',
    any: 'Any',
    gender: 'Roommate gender',
    budget: 'Budget up to',
    reset: 'Reset'
  },
  listing: {
    backToFeed: 'Back to listings',
    description: 'Description',
    habits: 'Habits and house rules',
    amenities: 'The flat has',
    price: 'Price',
    deposit: 'Deposit',
    noDeposit: 'none',
    type: 'Type',
    rooms: 'Rooms',
    published: 'Published',
    views: 'views',
    write: 'Send a message',
    writeFree: 'Free — the phone number is unlocked separately',
    showContacts: 'Show contacts',
    contactsHint: 'Charged once per listing from your account balance',
    topUp: 'Top up balance',
    loginToWrite: 'Sign in to message',
    report: 'Report this listing',
    safetyTitle: 'Never pay in advance',
    safetyText:
      'View the room in person, meet the flatmates, and only then talk about money. Qonys is not part of the payment.',
    safetyLink: 'How to verify a listing'
  },
  chat: {
    title: 'Messages',
    empty: 'No conversations yet',
    emptyHint: 'Message the author of a listing you like — the thread will show up here',
    placeholder: 'Write a message…',
    send: 'Send',
    newMessages: 'new',
    aboutListing: 'About listing',
    listingRemoved: 'This listing is no longer published',
    you: 'You',
    today: 'Today',
    yesterday: 'Yesterday',
    blockedHint: 'This conversation is closed',
    typingHint: 'Enter to send, Shift+Enter for a new line',
    flagged:
      'This looks like a request for prepayment or a push to another messenger. We flagged it for a moderator. Do not send money before seeing the room.',
    tooFast: 'Too fast. Please wait a few seconds',
    reportUser: 'Report this user'
  },
  support: {
    title: 'Support',
    subtitle: 'Message a moderator about a disputed listing, a refund, or a payment problem',
    startTitle: 'Describe the problem',
    subject: 'Subject',
    subjectPlaceholder: 'For example: contacts did not unlock after payment',
    create: 'Open a ticket',
    open: 'In progress',
    answered: 'Replied',
    closed: 'Closed',
    closedNote: 'This ticket is closed. Send a new message to reopen it',
    reopen: 'Reopen',
    slaHint: 'We reply within one business day',
    moderator: 'Qonys Support',
    ticket: 'Ticket'
  },
  auth: {
    loginTitle: 'Sign in to Qonys',
    registerTitle: 'Create an account',
    phone: 'Phone',
    password: 'Password',
    name: 'Name',
    submitLogin: 'Sign in',
    submitRegister: 'Create account',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    invalid: 'Wrong phone or password'
  },
  enums: {
    kind: {
      OFFER_ROOM: 'Offering a room',
      SEEK_ROOMMATE: 'Looking for a roommate'
    },
    housing: {
      SEPARATE_ROOM: 'Private room',
      SHARED_ROOM: 'Shared room',
      BED_SPACE: 'Bed in a shared room'
    },
    occupation: {
      STUDENT: 'Student',
      WORKING: 'Employed',
      REMOTE: 'Remote worker',
      OTHER: 'Other'
    },
    gender: {
      MALE: 'Male',
      FEMALE: 'Female'
    }
  }
};
