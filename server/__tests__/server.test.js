const request = require('supertest');
const express = require('express');
const app = require('./index'); // Your Express app

describe('GET /api/weather', () => {
    it('should return weather data for a valid city', async () => {
        const response = await request(app).get('/api/weather?city=London');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('weather');
    });

    it('should return 400 if no city is provided', async () => {
        const response = await request(app).get('/api/weather');
        expect(response.status).toBe(400);
    });
});