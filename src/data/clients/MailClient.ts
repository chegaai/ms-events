import axios, { AxiosInstance } from 'axios'
import { injectable, inject } from 'tsyringe'
import { IAppConfig } from '../../app.config'
import { Template } from './mail-templates/Template'
import { UnresponsiveServiceError } from '../errors/UnresponsiveServiceError'

@injectable()
export class MailClient {
  baseUrl: string
  http: AxiosInstance
  private lang: string

  constructor (@inject('MailClientConfig') { url, timeout, lang }: IAppConfig['clients']['mail']) {
    this.baseUrl = url
    this.http = axios.create({
      baseURL: url,
      timeout
    })
    this.lang = lang
  }

  /**
   * Calls ms-email to mail the given template and data to the given destination address
   * @param subject Email subject
   * @param to Email destination address
   * @param template Template that should be used by the email microservice to populate the message's body
   */
  async send (subject: string, to: string, template: Template) {
    const payload = {
      subject,
      to: [to],
      template: { 
        text: await template.getContent(),
        lang: this.lang
      },
      data: template.getData()
    }

    await this.http.post('/send', payload)
      .catch(err => {
        if (!err.response) throw new UnresponsiveServiceError(`Unresponsive service: "${this.baseUrl}/send"`)

        throw new Error(err.response.data.error.message)
      })
  }
}
