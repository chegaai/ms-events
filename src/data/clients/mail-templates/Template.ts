import { loadTemplate } from './loadTemplate'

export abstract class Template {
  private content: string = ''

  constructor (public readonly name: string) {}

  async getContent (): Promise<string> {
    this.content = this.content || await loadTemplate(this.name)
    return this.content
  }

  abstract getData (): any
}
