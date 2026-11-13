type PhotographCreditProps = {
  photograph: {
    author: string;
    source: string;
    license: string;
    licenseUrl: string;
  };
};

export function PhotographCredit({ photograph }: PhotographCreditProps) {
  return (
    <span className="discovery-photo-credit">
      Photo: <a href={photograph.source}>{photograph.author}</a>
      {" / "}<a href={photograph.licenseUrl}>{photograph.license}</a>
      {" / Cropped and toned for display."}
    </span>
  );
}
