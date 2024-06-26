/*
 *  Functions to fetch data from Sanity
 *
 */

import { createClient } from "@sanity/client"
import blocksToHtml from "@sanity/block-content-to-html"
import { get, has } from "lodash"
import imageUrlBuilder from "@sanity/image-url"

const SANITY_PROJECT_ID = "70kzkeor"

export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: "production",
  apiVersion: "2023-10-23", // use a UTC date string
  useCdn: true
})

const h = blocksToHtml.h

const prepareTextElements = (props: any) => {
  let textElements = []
  if (has(props, "node.caption.content"))
    textElements.push(
      h(
        "figcaption",
        { className: "caption" },
        toPlainText(props.node.caption.content)
      )
    )
  if (has(props, "node.attribution"))
    textElements.push(
      h("figcaption", { className: "credits" }, props.node.attribution)
    )
  return textElements
}

export const renderBlockText = text =>
  blocksToHtml({
    blocks: text,
    serializers: serializers,
    projectId: SANITY_PROJECT_ID,
    dataset: "production",
  })

export const toPlainText = (blocks = []) => {
  return blocks
    .map(block => {
      if (block._type !== "block" || !block.children) {
        return ""
      }
      return block.children.map(child => child.text).join("")
    })
    .join("\n\n")
}

export function extractTexts(editor: any): string[] {
  const texts: string[] = []

  for (let block of editor.content) {
    for (let child of block.children) {
      if (child.text) {
        texts.push(child.text)
      }
    }
  }

  return texts
}

const builder = imageUrlBuilder(client)

export const urlFor = (source: any) => builder.image(source)

const serializers = {
  marks: {
    link: props =>
      h(
        "a",
        { target: "_blank", rel: "noreferrer", href: props.mark.href },
        props.children
      ),
    norm: (props: any) => {
      return h("span", { className: "norm" }, props.children)
    },
    info: (props: any) => {
      return h("span", { className: "info" }, props.children)
    },
    alert: (props: any) => {
      return h("span", { className: "alert" }, props.children)
    },
    failure: (props: any) => {
      return h("span", { className: "failure" }, props.children)
    },
    success: (props: any) => {
      return h("span", { className: "success" }, props.children)
    },
    quote: (props: any) => {
      return h("span", { className: "quote" }, props.children)
    },
  },
  types: {
    block: (props: any) => {
      const style = props.node.style || "normal"
      return h("p", { className: style }, props.children)
    },
    // link: (props: any) => {
    //   return h("a", { href: props.node.href, target: "_blank" }, props.children)
    // },
    image: (props: any) => {
      return h("figure", { className: "image" }, [
        h("img", {
          src: urlFor(get(props, "node.asset", ""))
            .width(1200)
            .quality(100)
            .auto("format")
            .url(),
        }),
        ...prepareTextElements(props),
      ])
    },
  },
  image: props => {
    return h("figure", { className: "image" }, [
      h("img", {
        src: urlFor(get(props, "node.asset", ""))
          .width(1200)
          .quality(100)
          .auto("format")
          .url(),
      }),
      ...prepareTextElements(props),
    ])
  },
}

export const loadData = async (query: string, params: any) => {
  try {
    const res = await client.fetch(query, params)
    if (res === null) {
      return Promise.reject(new Error(404))
    }
    return res
  } catch (err) {
    return Promise.reject(new Error(404))
  }
}
