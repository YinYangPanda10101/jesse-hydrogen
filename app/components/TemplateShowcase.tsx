import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {TemplateShowcaseQuery} from 'storefrontapi.generated';

/**
 * Hydrogen port of the theme's `sections/template-showcase.liquid`.
 * Reads the same product metafields through the Storefront API:
 *   custom.stack            single line text
 *   custom.demo_url         URL
 *   custom.what_s_included  list of single line text
 * Each is optional; a card renders without it.
 */
export function TemplateShowcase({
  data,
  heading = 'Templates built to launch',
}: {
  data: TemplateShowcaseQuery | null;
  heading?: string;
}) {
  const products = data?.collection?.products.nodes ?? [];
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="template-showcase" className="my-12">
      <h2 id="template-showcase" className="mb-8 text-3xl font-medium">
        {heading}
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {products.map((product) => {
          const stack = product.stack?.value;
          const demoUrl = product.demoUrl?.value;
          const included = parseList(product.included?.value).slice(0, 4);
          const image = product.featuredImage;
          return (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded-md border border-black/10"
            >
              {image && (
                <Link to={`/products/${product.handle}`} tabIndex={-1}>
                  <Image
                    data={image}
                    alt={image.altText || product.title}
                    aspectRatio="4/3"
                    crop="center"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    loading="lazy"
                  />
                </Link>
              )}
              <div className="flex flex-1 flex-col gap-3 p-6">
                {stack && (
                  <p className="text-xs uppercase tracking-widest text-black/60">
                    {stack}
                  </p>
                )}
                <h3 className="text-lg font-medium">
                  <Link to={`/products/${product.handle}`}>{product.title}</Link>
                </h3>
                {included.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-black/80">
                    {included.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                <Money data={product.priceRange.minVariantPrice} />
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
                  <Link
                    to={`/products/${product.handle}`}
                    className="rounded bg-black px-5 py-3 text-white"
                  >
                    View template
                  </Link>
                  {demoUrl && (
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Live demo ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// list.single_line_text_field values arrive as a JSON-encoded array string.
function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export const TEMPLATE_SHOWCASE_QUERY = `#graphql
  fragment ShowcaseProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    stack: metafield(namespace: "custom", key: "stack") {
      value
    }
    demoUrl: metafield(namespace: "custom", key: "demo_url") {
      value
    }
    included: metafield(namespace: "custom", key: "what_s_included") {
      value
    }
  }
  query TemplateShowcase(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          ...ShowcaseProduct
        }
      }
    }
  }
` as const;
