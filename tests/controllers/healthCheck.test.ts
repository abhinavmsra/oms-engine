import {describe, expect, test} from '@jest/globals';
import { expressMock } from "../helpers/express"

import { ping } from "../../src/controllers/healthCheck";

describe('healthCheck#ping', () => {
  let req = expressMock.mockRequest();
  let res = expressMock.mockResponse();

  test("should respond with 200 status code", async () => {
    ping(req, res);
    expect(res.status).toHaveBeenCalledWith(200)
  })

  test("should respond with status ok message", async () => {
    ping(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' })
  })
})
