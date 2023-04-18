import semver from "semver";

export const compareDependenceVersion = (currentVersion: string, requiredVersion: string) => {
    // currentVersionを正規化する
    currentVersion = normalizeVersion(currentVersion);
    // requiredVersionを正規化する
    requiredVersion = normalizeVersion(requiredVersion);

    // requiredVersionが">="、">"、"<="、"<"のいずれかの演算子を持つかどうかを確認する
    const operator = requiredVersion[0];
    if (operator === ">" || operator === "<") {
        requiredVersion = `${operator}=${requiredVersion.slice(1)}`;
    }

    // semverパッケージを使用して、現在のバージョンと必要なバージョンを比較する
    const semver = require("semver");
    return semver.satisfies(currentVersion, requiredVersion);
}

// バージョンを正規化するためのヘルパー関数
function normalizeVersion(version: string) {
    if (!version) {
        return "";
    }
    // バージョンをx.y.zの形式に正規化する
    const normalized = semver.valid(semver.coerce(version));
    return normalized ? normalized : "";
}
