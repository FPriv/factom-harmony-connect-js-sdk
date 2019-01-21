/* eslint-env jest */
import axios from 'axios';
import APICall from '../lib/api';

jest.mock('axios');
describe('APICall Test', () => {
  describe('constructor', () => {
    it('should return error message when URL is invalid', () => {
      try {
        // eslint-disable-next-line no-new
        new APICall({
          baseURL: 'apicast',
          accessToken: {
            app_id: '123456',
            app_key: '123456789',
          },
        });
      } catch (error) {
        expect(error).toEqual(new Error('The base URL provided is not valid.'));
      }
    });

    it('should return error message when access token is missing', () => {
      try {
        // eslint-disable-next-line no-new
        new APICall({
          baseURL: 'https://apicast.io/',
        });
      } catch (error) {
        expect(error).toEqual(new Error('The accessToken is required.'));
      }
    });

    it('should produce a new APICall class', () => {
      // eslint-disable-next-line no-new
      const api = new APICall({
        baseURL: 'https://apicast.io/',
        accessToken: {
          app_id: '123456',
          app_key: '123456789',
        },
      });

      expect(api).toEqual({
        baseURL: 'https://apicast.io/',
        accessToken:
        {
          app_id: '123456',
          app_key: '123456789',
        },
      });
    });
  });

  describe('send request', () => {
    let apiCall;
    beforeAll(() => {
      apiCall = new APICall({
        baseURL: 'https://apicast.io/',
        accessToken: {
          app_id: '123456',
          app_key: '123456789',
        },
      });
    });
    describe('GET Request', () => {
      it('should send request sucessfully.', async () => {
        const resp = {
          status: 200,
          data: {
            api_version: 'v1',
          },
        };
        axios.mockImplementationOnce(() => Promise.resolve(resp));
        const response = await apiCall.send('GET');
        expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
        expect(response).toEqual({ api_version: 'v1' });
      });
      it('should return empty object when receiving response status > 202 and < 400.', async () => {
        const resp = {
          status: 300,
          data: {
            api_version: 'v1',
          },
        };
        axios.mockImplementationOnce(() => Promise.resolve(resp));
        const response = await apiCall.send('GET');
        expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
        expect(response).toEqual({});
      });
      it('should send request sucessfully with data.', async () => {
        const data = {
          chain_id: '123456',
        };
        const resp = {
          status: 200,
          data: {
            api_version: 'v1',
          },
        };
        axios.mockImplementationOnce(() => Promise.resolve(resp));
        const response = await apiCall.send('GET', '', data);
        expect(axios).toHaveBeenCalledWith('https://apicast.io?chain_id=123456', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
        expect(response).toEqual({ api_version: 'v1' });
      });
      it('should return error when receiving response status > 400.', async () => {
        const resp = {
          status: 500,
          response: {
            status: 500,
            statusText: 'Server internal error',
          },
        };
        try {
          axios.mockImplementationOnce(() => Promise.resolve(resp));
          await apiCall.send('GET');
          expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
        } catch (error) {
          expect(error).toEqual(new Error({
            status: 500,
            message: 'Server internal error',
          }));
        }
      });
      it('should return error when encountering unexpected cases.', async () => {
        const resp = {
          status: 500,
          response: {
            status: 500,
            statusText: 'APICall throw error.',
          },
        };
        try {
          axios.mockImplementationOnce(() => Promise.reject(resp));
          await apiCall.send('GET');
          expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: '', headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'GET' });
        } catch (error) {
          expect(error).toEqual(resp);
        }
      });
    });
    describe('POST Request', () => {
      it('should send request sucessfully.', async () => {
        const data = {
          chain_id: '123456',
        };
        const resp = {
          status: 200,
          data: {
            api_version: 'v1',
          },
        };
        axios.mockImplementationOnce(() => Promise.resolve(resp));
        const response = await apiCall.send('POST', '', data);
        expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: data, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
        expect(response).toEqual({ api_version: 'v1' });
      });
      it('should return error when receiving response status > 400.', async () => {
        const data = {
          chain_id: '123456',
        };
        const resp = {
          status: 500,
          response: {
            status: 500,
            statusText: 'Server internal error',
          },
        };
        try {
          axios.mockImplementationOnce(() => Promise.resolve(resp));
          await apiCall.send('POST', '', data);
          expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: data, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
        } catch (error) {
          expect(error).toEqual(new Error({
            status: 500,
            message: 'Server internal error',
          }));
        }
      });
      it('should return error when encountering unexpected cases.', async () => {
        const data = {
          chain_id: '123456',
        };
        const resp = {
          status: 500,
          response: {
            status: 500,
            statusText: 'APICall throw error.',
          },
        };
        try {
          axios.mockImplementationOnce(() => Promise.reject(resp));
          await apiCall.send('POST', '', data);
          expect(axios).toHaveBeenCalledWith('https://apicast.io', { data: data, headers: { 'Content-Type': 'application/json', app_id: '123456', app_key: '123456789' }, method: 'POST' });
        } catch (error) {
          expect(error).toEqual(resp);
        }
      });
    });
  });
});
