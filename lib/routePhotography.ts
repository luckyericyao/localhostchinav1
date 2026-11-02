function photograph(key: string, file: string, author: string, license: string) {
  const source = `https://commons.wikimedia.org/wiki/${encodeURIComponent(file)}`;
  const version = license.split(" ").at(-1);
  const licenseUrl = license === "Public domain" ? source : `https://creativecommons.org/licenses/${license.includes("SA") ? "by-sa" : "by"}/${version}/`;
  return { src: `/images/routes/${key}.jpg`, source, author, license, licenseUrl };
}

// Source licenses checked against Commons imageinfo on 2026-11-02.
// These photographs document places, not Localhost clients or scouting visits.
export const routePhotography = {
  yungang: photograph("yungang", "File:Yungang11 2010.JPG", "Marcin Białek", "CC BY-SA 4.0"),
  yingxian: photograph("yingxian", "File:Pagoda of Fogong Temple at Dust.jpg", "Charlie fong", "CC BY-SA 4.0"),
  jinci: photograph("jinci", "File:Jinci Temple 74094-Taiyuan (49222882987).jpg", "xiquinhosilva", "CC BY 2.0"),
  shaolin: photograph("shaolin", "File:20241103 Gate of Shaolin Temple.jpg", "Windmemories", "CC BY-SA 4.0"),
  pagoda: photograph("pagoda", "File:20241103 Pagoda Forest of Shaolin Temple 01.jpg", "Windmemories", "CC BY-SA 4.0"),
  songyang: photograph("songyang", "File:20250629 Songyang Academy 10.jpg", "Windmemories", "CC BY-SA 4.0"),
  hongcun: photograph("hongcun", "File:Yixian Hongcun 2016.09.10 07-00-51.jpg", "Zhangzhugang", "CC BY-SA 4.0"),
  xidi: photograph("xidi", "File:Xidi - 05.JPG", "Anna Frodesiak", "Public domain"),
  huangshan: photograph("huangshan", "File:Huangshan, September 2018 26.jpg", "De-Shao Liu (Terry850324)", "CC BY-SA 4.0"),
  bund: photograph("bund", "File:外灘 The Bund (6057926946).jpg", "Can Pac Swire", "CC BY-SA 2.0"),
  wukang: photograph("wukang", "File:Street View of Wukang Road.JPG", "Livelikerw", "CC BY-SA 3.0"),
  yuyuan: photograph("yuyuan", "File:Shanghai - Yu Garden - 0035.jpg", "Stefan Fussan", "CC BY-SA 3.0")
} as const;
