// The texts of recent prompts you sent with an image or file attached, so your
// card keeps the app's own row (which draws the attachment) for those.
export type MediaTexts = string[]

declare module 'claude-code' {
  interface PluginState {
    'claude-retro-theme': { withMedia: Shaped<MediaTexts> }
  }
}
