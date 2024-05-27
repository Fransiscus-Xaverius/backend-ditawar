import axios, { Axios } from "axios";

class ApiService {
  private axiosInstance: Axios;
  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL,
    });
  }
  async get<T>(url: string, headers = {}): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, { headers });
    return response.data;
  }
  async query<T>(url: string, payload: any, headers = {}): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, payload, {
      headers,
    });
    return response.data;
  }

  async post<T>(url: string, data = {}, headers = {}): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, { headers });
    return response.data;
  }

  async put<T>(url: string, data: any, headers = {}): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, { headers });
    return response.data;
  }

  async patch<T>(url: string, data: any, headers = {}): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, { headers });
    return response.data;
  }

  async delete<T>(url: string, headers = {}): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, { headers });
    return response.data;
  }
}

export const apiService = new ApiService("");
