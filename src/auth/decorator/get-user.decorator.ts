import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "src/users/user.schema";

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);