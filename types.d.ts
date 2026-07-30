import { ThreeElements } from '@react-three/fiber'
import React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
