import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import markdownStyles from './markdown-styles.module.css'
import { BLOCKS, MARKS } from '@contentful/rich-text-types'
import Image from "next/image"
import { CodeBlock, dracula } from "react-code-blocks";

function MyCoolCodeBlock({ code, language, showLineNumbers, startingLineNumber }) {
  return (
    <CodeBlock
      text={code}
      language={language}
      showLineNumbers={showLineNumbers}
      startingLineNumber={startingLineNumber}
      theme={dracula}
    />
  );
}

const getRenderOptions = (links) => {

  //for all the link elements, store these as mapped assets
  const blockAssets = new Map(
    links.assets.block.map((asset) => [asset.sys.id, asset])
  );

  //What are entries? Embedded elements in code...
  const blockEntries = new Map(
    links.entries.block.map((entry) => [entry.sys.id, entry])
  )

  return {
    renderNode : {
      [BLOCKS.HEADING_2]: (node, children) => {
        return <h2 className="underline italic">{children}</h2>
      },
      [MARKS.ITALIC]: (node, children) => {
        return <i className="italic">{children}</i>
      },
      [BLOCKS.EMBEDDED_ASSET]: (node, children) => {

        const asset = blockAssets.get(node.data.target.sys.id);
        const { url, width, height, description } = asset;
        return (
          <Image
            className="border"
            src={url}
            width={width}
            height={height}
            alt={description}
          />
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
        const entry = blockEntries.get(node.data.target.sys.id);

        console.log(entry)

        if (typeof entry !== 'undefined'){
          //Hack for recursive embedding - this doesn't work. todo, ish.

          if (entry.__typename === "Details") {
            return (
              <details>
                <summary>{entry.title}</summary>
                {documentToReactComponents(entry.body.json, getRenderOptions(links))}
              </details>
            );
          }

          if (entry.__typename === "Codeblock") {
            return (
              <CodeBlock
                text={entry.code}
                language={entry.language}
                showLineNumbers={entry.showLineNumbers}
                startingLineNumber={entry.startingLineNumber}
                theme={dracula}
              />
            );
          }
          
        }
      },
    }
  }
}

export default function PostBody({ content }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className={markdownStyles['markdown']}>
        {documentToReactComponents(content.json, getRenderOptions(content.links))}
      </div>
    </div>
  )
}
