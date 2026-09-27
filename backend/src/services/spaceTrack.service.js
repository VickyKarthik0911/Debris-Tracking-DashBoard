import axios from "axios";
import { config } from "../config/env.js";

class SpaceTrackService {
  constructor() {
    this.client = axios.create({
      baseURL: config.spaceTrack.baseUrl,
      timeout: 25000,
      withCredentials: true,
    });
    this.cookie = null;
    this.cookieExpiresAt = 0;
  }

  async authenticate() {
    const now = Date.now();
    if (this.cookie && now < this.cookieExpiresAt) return;

    const params = new URLSearchParams();
    params.set("identity", config.spaceTrack.username);
    params.set("password", config.spaceTrack.password);

    const response = await this.client.post("/ajaxauth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const setCookie = response.headers["set-cookie"] || [];
    if (!setCookie.length) {
      throw new Error("Space-Track authentication failed: no cookie returned");
    }

    this.cookie = setCookie.map((entry) => entry.split(";")[0]).join("; ");
    this.cookieExpiresAt = now + 45 * 60 * 1000;
  }

  async request(path) {
    await this.authenticate();
    return this.client.get(path, {
      headers: {
        Cookie: this.cookie,
      },
    });
  }

  async fetchSatcat(limit = config.maxObjects) {
    const path = `/basicspacedata/query/class/satcat/orderby/NORAD_CAT_ID asc/format/json/limit/${limit}`;
    const response = await this.request(path);
    return response.data || [];
  }

  async fetchTle(limit = config.maxObjects) {
    const path = `/basicspacedata/query/class/gp/orderby/NORAD_CAT_ID asc/EPOCH/%3Enow-7/format/json/limit/${limit}`;
    const response = await this.request(path);
    return response.data || [];
  }
}

export const spaceTrackService = new SpaceTrackService();
