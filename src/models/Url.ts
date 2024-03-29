import { Ref, getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import { User } from '@/models/User'
import i18n from '@/helpers/i18n'

// const Categories = {
//   POLITICS: i18n.t(lng, 'give_new_folder'),
//   OTHER: i18n.t(lng, 'give_new_folder'),
// }

@modelOptions({ schemaOptions: { timestamps: true } })
export class Url {
  @prop({ index: true, ref: User })
  user?: Ref<User>
  @prop({ required: true })
  url!: string
  @prop({ required: true, default: [], type: () => [String] })
  categories!: string[]
}

export const UrlModel = getModelForClass(Url)

export function isURLToFolder(text: string) {
  const urlPattern = /(https?:\/\/)?t\.me\/addlist\/[-\w]+/
  return urlPattern.test(text)
}

export function isURL(text: string): boolean {
  const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
  return urlPattern.test(text)
}

export async function getNewUrl(user: User) {
  const query: any = {
    _id: { $nin: user.receivedUrlsID },
  }

  if (user.currentCategorySelection.length > 0) {
    query.categories = { $in: user.currentCategorySelection }
  }

  const unreceivedUrls = await UrlModel.find(query, { _id: 1 })
  return unreceivedUrls[0]
}

export function findOrCreateUrl(url: string, user: User) {
  return UrlModel.findOneAndUpdate(
    { url, user },
    {},
    {
      upsert: true,
      new: true,
    }
  )
}

export async function findLastAddedUrl(user: User) {
  return await UrlModel.findOne({ user: user }).sort({
    createdAt: -1,
  })
}
