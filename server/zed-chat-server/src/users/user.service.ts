import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { ConversationService } from 'src/conversations/conversation.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, 
    private conversationService: ConversationService
  ) {
    
  }
  findAll(): Promise<User[]> {
      return this.usersRepository.find();
  }
  async findOne(id: string): Promise<User> {
      const user = await this.usersRepository.findOne(id, { relations: ["conversations"] });
      for(let conv of user.conversations){
        conv.messages = await this.conversationService.getMessages(conv.id);
      }
      return user;
  }
  async remove(id: string): Promise<string> {
      await this.usersRepository.delete(id);
      return `User successfully removed ID: ${id}`
  }
  options(): any {
      return { availableMethods : ["GET", "POST", "DELETE", "OPTIONS"]}
  }
  findByTagName(tagName: string): Promise<User> {
    return this.usersRepository.findOne({ where: {tagName: `${tagName}`}, relations: ["conversations"]});
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
      let hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = new User();
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      user.email = createUserDto.email;
      user.password = hashedPassword;
      user.session = createUserDto.session;
      user.tagName = createUserDto.tagName;
      createUserDto.password = undefined;
      return this.usersRepository.save(user);
  }
  async addConversation(userId: string, conversationId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId, { relations: ["conversations"]});
    const conversation = await this.conversationService.findOne(conversationId);
    user.conversations.push(conversation);
    return user
  }
}