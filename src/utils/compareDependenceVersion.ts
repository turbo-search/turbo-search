import semver from "semver";

export const compareDependenceVersion = (
  currentVersion: string,
  requiredVersion: string
) => {
  // currentVersionを正規化する
  currentVersion = normalizeVersion(currentVersion);
  // requiredVersionを正規化する
  requiredVersion = normalizeVersionObj(requiredVersion);
  // semverパッケージを使用して、現在のバージョンと必要なバージョンを比較する
  return semver.satisfies(currentVersion, requiredVersion);
};

// バージョンを正規化するためのヘルパー関数
function normalizeVersionObj(version: string) {
  if (!version) {
    return "";
  }
  // バージョンをx.y.zの形式に正規化する
  //初めの文字が>=,>,<=,<のいずれかの場合は、それを抜きだす
  //戻り値は、{operator:">=",version:"1.0.0"}のようなオブジェクト
  const versionParts = version.match(/^(>=|>|<=|<)?(.*)$/);

  return versionParts &&
    (versionParts[1] == ">=" ||
      versionParts[1] == ">" ||
      versionParts[1] == "<" ||
      versionParts[1] == "<=")
    ? versionParts[1] + version
    : "=" + semver.valid(semver.coerce(version));
}

function normalizeVersion(version: string) {
  if (!version) {
    return "";
  }
  // バージョンをx.y.zの形式に正規化する
  const normalized = semver.valid(semver.coerce(version));
  return normalized ? normalized : "";
}
