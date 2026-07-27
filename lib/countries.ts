export type CountryOption = {
  code: string;
  name: string;
  region: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "IN", name: "印度", region: "南亚" },
  { code: "BD", name: "孟加拉国", region: "南亚" },
  { code: "PK", name: "巴基斯坦", region: "南亚" },
  { code: "LK", name: "斯里兰卡", region: "南亚" },
  { code: "NP", name: "尼泊尔", region: "南亚" },
  { code: "ID", name: "印度尼西亚", region: "东南亚" },
  { code: "PH", name: "菲律宾", region: "东南亚" },
  { code: "VN", name: "越南", region: "东南亚" },
  { code: "TH", name: "泰国", region: "东南亚" },
  { code: "MY", name: "马来西亚", region: "东南亚" },
  { code: "SG", name: "新加坡", region: "东南亚" },
  { code: "US", name: "美国", region: "北美" },
  { code: "CA", name: "加拿大", region: "北美" },
  { code: "MX", name: "墨西哥", region: "北美" },
  { code: "BR", name: "巴西", region: "拉美" },
  { code: "AR", name: "阿根廷", region: "拉美" },
  { code: "CO", name: "哥伦比亚", region: "拉美" },
  { code: "CL", name: "智利", region: "拉美" },
  { code: "PE", name: "秘鲁", region: "拉美" },
  { code: "GB", name: "英国", region: "欧洲" },
  { code: "DE", name: "德国", region: "欧洲" },
  { code: "FR", name: "法国", region: "欧洲" },
  { code: "ES", name: "西班牙", region: "欧洲" },
  { code: "IT", name: "意大利", region: "欧洲" },
  { code: "AU", name: "澳大利亚", region: "大洋洲" },
  { code: "JP", name: "日本", region: "东亚" },
  { code: "KR", name: "韩国", region: "东亚" }
];

export const COUNTRY_CODES = new Set(COUNTRY_OPTIONS.map((country) => country.code));

export const COUNTRY_GROUPS = [
  {
    id: "south-asia",
    label: "南亚",
    countries: ["IN", "BD", "PK", "LK", "NP"]
  },
  {
    id: "southeast-asia",
    label: "东南亚",
    countries: ["ID", "PH", "VN", "TH", "MY", "SG"]
  },
  {
    id: "latam",
    label: "拉美",
    countries: ["BR", "MX", "AR", "CO", "CL", "PE"]
  },
  {
    id: "europe-core",
    label: "欧洲核心",
    countries: ["GB", "DE", "FR", "ES", "IT"]
  }
];
