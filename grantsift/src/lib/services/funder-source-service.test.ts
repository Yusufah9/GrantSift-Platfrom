import { describe, it, expect } from "vitest";
import { assertFetchableUrl } from "@/lib/services/funder-source-service";
import { AppError } from "@/lib/errors/app-error";

describe("assertFetchableUrl", () => {
  it("allows a normal https funder URL", () => {
    expect(() => assertFetchableUrl("https://example-foundation.org/grants")).not.toThrow();
  });

  it("allows plain http", () => {
    expect(() => assertFetchableUrl("http://example-foundation.org")).not.toThrow();
  });

  it("rejects a non-URL string", () => {
    expect(() => assertFetchableUrl("not a url")).toThrow(AppError);
  });

  it("rejects a non-http(s) scheme", () => {
    expect(() => assertFetchableUrl("file:///etc/passwd")).toThrow(AppError);
    expect(() => assertFetchableUrl("ftp://example.org")).toThrow(AppError);
  });

  it("rejects localhost", () => {
    expect(() => assertFetchableUrl("http://localhost:3000/admin")).toThrow(AppError);
  });

  it("rejects loopback and private network ranges", () => {
    expect(() => assertFetchableUrl("http://127.0.0.1")).toThrow(AppError);
    expect(() => assertFetchableUrl("http://10.0.0.5")).toThrow(AppError);
    expect(() => assertFetchableUrl("http://192.168.1.1")).toThrow(AppError);
    expect(() => assertFetchableUrl("http://169.254.169.254")).toThrow(AppError); // cloud metadata endpoint
    expect(() => assertFetchableUrl("http://172.16.0.1")).toThrow(AppError);
  });

  it("allows a public IP-looking host that is not in a private range", () => {
    expect(() => assertFetchableUrl("http://8.8.8.8")).not.toThrow();
  });
});
