import { dateFormat } from "../format";

describe("format", () => {
  describe("dateFormat", () => {});
  it("should be format date string with '秒前'", () => {
    const now = new Date("2020-05-01T01:23:45");
    const target = new Date("2020-05-01T01:23:20");

    const actual = dateFormat(now, target);
    expect(actual).toBe(`25秒前`);
  });

  it("should be format date string with '分前'", () => {
    const now = new Date("2020-05-01T01:23:45");
    const target = new Date("2020-05-01T00:51:20");

    const actual = dateFormat(now, target);
    expect(actual).toBe(`32分前`);
  });

  it("should be format date string with '時間前'", () => {
    const now = new Date("2020-05-01T01:23:45");
    const target = new Date("2020-04-30T22:01:11");

    const actual = dateFormat(now, target);
    expect(actual).toBe(`3時間前`);
  });

  it("should be format date string with '月' and '日'", () => {
    const now = new Date("2020-05-01T01:23:45");
    const target = new Date("2020-03-27T01:23:45");

    const actual = dateFormat(now, target);
    expect(actual).toBe(`3月27日`);
  });
});
