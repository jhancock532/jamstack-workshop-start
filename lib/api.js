import posts from "../data/posts";

// /lib/api.js
// use this helper function
// (Provided by tutorial!)
async function fetchGraphQL(query) {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    }
  ).then((response) => response.json());
}

/**
 * This method is called in `/pages/index.js`
 */
export async function getAllPostsForHome() {

  let returnedPosts = await fetchGraphQL(`{
    postCollection(order: date_ASC, limit: 10) {
      items {
        title
        coverImage {
          url
          width
          height
        }
        excerpt
        content {
          json
          links {
            assets {
              block {
                sys {
                  id
                }
                url
                size
                width
                height
              }
            }
          }
        }
        author {
          name
          picture {
            url
            width
            height
          }
        }
        date
        slug
      }
    }
  }`);

  //console.log(newposts.data.postCollection.items)
  return returnedPosts.data.postCollection.items;
}

/**
 * This method is called in `/pages/posts/[slug].js`
 */
export async function getAllPostsWithSlug() {
  let returnedPosts = await fetchGraphQL(`{
    postCollection(order: date_ASC, limit: 10) {
      items {
        title
        coverImage {
          url
          width
          height
        }
        excerpt
        content {
          json
          links {
            assets {
              block {
                sys {
                  id
                }
                url
                size
                width
                height
              }
            }
          }
        }
        author {
          name
          picture {
            url
            width
            height
          }
        }
        date
        slug
      }
    }
  }`);
  return returnedPosts.data.postCollection.items;
}

/**
 * This method is called in `/pages/posts/[slug].js
 *
 * @param {String} slug
 */
export async function getPostAndMorePosts(slug) {
  // TODO Change me, I want to make HTTP calls!

  let postSlugs = await fetchGraphQL(`{
    postCollection(order: date_ASC, limit: 10) {
      items {
        title
        coverImage {
          url
          width
          height
        }
        excerpt
        content {
          json
          links {
            assets {
              block {
                sys {
                  id
                }
                url
                size
                width
                height
              }
            }
            entries {
              block {
                __typename
                sys {
                  id
                }
                ... on Details {
                  title
                  body {
                    json
                  }
                }
                ... on Codeblock {
                  code
                  showLineNumbers
                  startingLineNumber
                  language
                }
              }
            }
          }
        }
        author {
          name
          picture {
            url
            width
            height
          }
        }
        date
        slug
      }
    }
  }`);

  let posts = postSlugs.data.postCollection.items;

  const currentPost = posts.find((post) => post.slug === slug);

  const currentPostIndex = posts.findIndex((post) => post.slug === slug);
  const prevPost = posts[currentPostIndex - 1] || posts[posts.length - 1];
  const nextPost = posts[currentPostIndex + 1] || posts[0];

  if (!currentPost) {
    return {
      post: false,
    };
  }

  return {
    post: currentPost,
    morePosts: [prevPost, nextPost],
  };
}
