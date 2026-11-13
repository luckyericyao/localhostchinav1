import { routePhotography } from "@/lib/routePhotography";

// Explicit source widths keep tall cover crops sharp and selection predictable.
const coverImageSizes =
  "(max-width: 600px) 1600px, (max-width: 1199px) 1920px, 100vw";

export const discoveryChapters = [
  {
    place: "Shanxi",
    slug: "shanxi",
    number: "01",
    region: "Northern China",
    perspective: "Stone, timber, and northern roads",
    regionalContext:
      "Buddhist caves near Datong give way to timber construction at Yingxian. Jinci brings you closer to Taiyuan. The distances are part of the chapter, with time for noodles and local tables between sites.",
    setting: "Datong / Yingxian / Taiyuan",
    introduction:
      "The carved chambers of Yungang. The timber structure of Yingxian. The courtyards of Jinci. A journey through northern China, with time to look closely.",
    imageAlt: "Buddhist figures carved into the sandstone cliff at Yungang, Shanxi.",
    imageCaption: "Yungang Grottoes, Datong",
    photograph: routePhotography.yungang
  },
  {
    place: "Shaolin",
    slug: "shaolin",
    number: "02",
    region: "Dengfeng / Henan",
    perspective: "Practice beneath Songshan",
    regionalContext:
      "Dengfeng brings Shaolin's monastic landscape, the Pagoda Forest, and Songyang Academy into one regional story. Chan heritage and mountain paths give martial practice its context. A training visit depends on permission, not an advertised performance.",
    setting: "Dengfeng / Songshan",
    introduction:
      "A monastery gate, the Pagoda Forest, and the paths of Songshan. Read Shaolin through Chan heritage and the patient repetition of martial practice.",
    imageAlt: "Weathered brick pagodas rise among pine and cypress trees in Shaolin's Pagoda Forest.",
    imageCaption: "The Pagoda Forest, Shaolin",
    imagePosition: "50% 42%",
    imageSizes: coverImageSizes,
    photograph: {
      src: "/images/chapters/shaolin-pagoda-forest.webp",
      source: "https://commons.wikimedia.org/wiki/File:Shaolin_Pagoda_Forest_2019_(48840492093).jpg",
      author: "Gary Todd",
      license: "Public domain",
      licenseUrl: "https://commons.wikimedia.org/wiki/File:Shaolin_Pagoda_Forest_2019_(48840492093).jpg"
    }
  },
  {
    place: "Huizhou",
    slug: "huizhou",
    number: "03",
    region: "Huizhou / Anhui",
    perspective: "Villages, merchant houses, mountain weather",
    regionalContext:
      "Hongcun and Xidi bring white walls, ancestral halls, and the traces of merchant families into view. Huangshan asks for a separate mountain day, not a village stop added in passing. Tea and weather help give this chapter its pace.",
    setting: "Hongcun / Xidi / Huangshan",
    introduction:
      "Follow the water through Hongcun, look behind the carved doorways of Xidi, then turn toward Huangshan. Village life, merchant history, and mountains share the frame.",
    imageAlt: "Layered white gables and dark tiled roofs at Hongcun, reflected in still water below a wooded hillside.",
    imageCaption: "Hongcun, Huizhou",
    imagePosition: "50% 0%",
    imageSizes: coverImageSizes,
    photograph: {
      src: "/images/chapters/huizhou-waterfront.webp",
      source: "https://unsplash.com/photos/m5ho9Bcs1NI",
      author: "Himmel S",
      license: "Unsplash License",
      licenseUrl: "https://unsplash.com/license"
    }
  },
  {
    place: "Shanghai",
    slug: "shanghai",
    number: "04",
    region: "Shanghai",
    perspective: "A city read from the river inward",
    regionalContext:
      "The Bund, Wukang Road, and Yu Garden offer different readings of the city. A considered dinner and an evening on foot can sit alongside arrival and onward plans. Shanghai can stand alone, or begin a longer route.",
    setting: "The Bund / Wukang Road / Yu Garden",
    introduction:
      "Begin by the river. Walk from the Bund into the city's streets, make time for dinner, and let the evening find a different pace. A first stop, with more to discover.",
    imageAlt: "The Pudong skyline across the Huangpu River at dusk, with the Oriental Pearl and Shanghai Tower.",
    imageCaption: "Across the Huangpu, Shanghai",
    imagePosition: "62% 0%",
    imageSizes: coverImageSizes,
    photograph: {
      src: "/images/chapters/shanghai-at-dusk.webp",
      source: "https://commons.wikimedia.org/wiki/File:Pudong_Shanghai_November_2017_panorama.jpg",
      author: "King of Hearts",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
    }
  }
] as const;
