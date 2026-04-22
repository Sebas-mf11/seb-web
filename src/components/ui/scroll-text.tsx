'use client'

import { cn } from '@/lib/utils'
import { motion, useInView, type Transition, type Variant } from 'framer-motion'
import { Fragment, useMemo, useRef } from 'react'

type Direction = 'left' | 'right' | 'up' | 'down'

const directionHidden: Record<Direction, { x?: number; y?: number }> = {
  left: { x: -48 },
  right: { x: 48 },
  up: { y: -48 },
  down: { y: 48 },
}

function pickTransition(
  visible: Record<string, unknown>,
  extra?: Transition,
): Transition | undefined {
  const t = visible.transition
  if (t && typeof t === 'object' && extra) {
    return { ...t, ...extra }
  }
  if (extra) return extra
  if (t && typeof t === 'object') return t as Transition
  return undefined
}

export type TextAnimationProps = {
  text: string
  variants?: {
    hidden: Record<string, unknown>
    visible: Record<string, unknown> & { transition?: Transition }
  }
  classname?: string
  as?: 'div' | 'p' | 'span'
  letterAnime?: boolean
  direction?: Direction
  lineAnime?: boolean
}

export default function TextAnimation({
  text,
  variants,
  classname,
  as = 'div',
  letterAnime = false,
  direction = 'left',
  lineAnime = false,
}: TextAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: false,
    margin: '-12% 0px -12% 0px',
    amount: 0.2,
  })

  const hidden = useMemo(
    () => ({
      opacity: 0,
      filter: 'blur(8px)',
      ...directionHidden[direction],
      ...(variants?.hidden ?? {}),
    }),
    [direction, variants?.hidden],
  )

  const visible = useMemo(
    () => ({
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      ...(variants?.visible ?? {}),
    }),
    [variants?.visible],
  )

  const blockVariants: { hidden: Variant; visible: Variant } = {
    hidden,
    visible,
  }

  const LetterTag =
    as === 'p' ? motion.p : as === 'span' ? motion.span : motion.div
  const BlockTag =
    as === 'p' ? motion.p : as === 'span' ? motion.span : motion.div

  if (letterAnime) {
    const { transition: _t, ...visibleMotion } = visible
    return (
      <div ref={ref} className={cn(classname)}>
        <LetterTag className="inline-block max-w-full whitespace-normal break-words [word-break:normal] [overflow-wrap:anywhere] hyphens-none">
          {text.split('').map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              className="inline-block"
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={{
                hidden,
                visible: {
                  ...visibleMotion,
                  transition: pickTransition(visible, {
                    type: 'spring',
                    stiffness: 280,
                    damping: 24,
                    delay: index * 0.02,
                  }),
                },
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </LetterTag>
      </div>
    )
  }

  if (lineAnime) {
    const words = text.split(/\s+/).filter(Boolean)
    const { transition: _t, ...visibleMotion } = visible
    return (
      <div ref={ref} className={cn(classname)}>
        <p className="break-words text-center [overflow-wrap:anywhere] [word-break:normal] hyphens-none">
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              {index > 0 ? (
                <span className="select-none" aria-hidden>
                  {' '}
                </span>
              ) : null}
              <motion.span
                className="inline-block whitespace-nowrap"
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={{
                  hidden,
                  visible: {
                    ...visibleMotion,
                    transition: pickTransition(visible, {
                      duration: 0.45,
                      delay: index * 0.06,
                    }),
                  },
                }}
              >
                {word}
              </motion.span>
            </Fragment>
          ))}
        </p>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn(classname)}>
      <BlockTag
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={blockVariants}
        className="block w-full break-words [overflow-wrap:anywhere] [word-break:normal] hyphens-none"
      >
        {text}
      </BlockTag>
    </div>
  )
}
