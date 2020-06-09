// abstraction of the framer-motion animation variables.
// when looking at it, its best to think about the animations as
// a state machine, with us defining various states / frames of animation
// and then having framer-motion sprinkle in the magic that makes everything
// animation smoothly.

// animation curve
export const slideTransition = {
  type: 'spring',
  damping: 15,
  stiffness: 90,
};

// slide menu
export const slideMenuVariants = {
  open: {
    x: 0,
  },
  closed: {
    x: 340,
  },
};

export const slideMenuMobileVariants = {
  open: {
    y: 0,
  },
  closed: {
    y: 460,
  },
};

// slide menu button
export const slideBtnVariants = {
  closed: {
    x: 0,
    rotate: 0,
    borderRadius: 10,
  },
  open: {
    x: -265,
    rotate: 135,
    borderRadius: 50,
  },
};

// slide menu colored inner squares
export const slideBtnCherryVariants = {
  closed: {
    x: 16,
    y: 16,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  open: {
    x: 24,
    y: 12,
    width: 4,
    height: 12,
  },
};

export const slideBtnSageVariants = {
  closed: {
    x: 28,
    y: 16,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  open: {
    x: 28,
    y: 24,
    width: 12,
    height: 4,
  },
};

export const slideBtnTangerineVariants = {
  closed: {
    x: 16,
    y: 28,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  open: {
    x: 12,
    y: 24,
    width: 12,
    height: 4,
  },
};

export const slideBtnBlueberryVariants = {
  closed: {
    x: 28,
    y: 28,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  open: {
    x: 24,
    y: 28,
    width: 4,
    height: 12,
  },
};
