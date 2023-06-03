import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { RuleService } from './rule.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/role.guard';

@ApiTags('Rules')
@ApiBearerAuth()
@Controller('rule')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @SetMetadata('role', ['admin'])
  @UseGuards(AuthGuard('refresh'), RolesGuard)
  @Post()
  create(@Body() createRuleDto: CreateRuleDto) {
    return this.ruleService.create(createRuleDto);
  }

  @SetMetadata('role', ['admin'])
  @UseGuards(AuthGuard('refresh'), RolesGuard)
  @Get()
  findAll() {
    return this.ruleService.findAll();
  }

  @SetMetadata('role', ['admin'])
  @UseGuards(AuthGuard('refresh'), RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ruleService.findOne(id);
  }

  @SetMetadata('role', ['admin'])
  @UseGuards(AuthGuard('refresh'), RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRuleDto: UpdateRuleDto) {
    return this.ruleService.update(id, updateRuleDto);
  }

  @SetMetadata('role', ['admin'])
  @UseGuards(AuthGuard('refresh'), RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ruleService.remove(id);
  }
}
