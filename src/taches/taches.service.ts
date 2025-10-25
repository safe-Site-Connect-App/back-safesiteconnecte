import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tache } from './schemas/tach.schema';
import { CreateTacheDto } from './dto/create-tach.dto';
import { UpdateTacheDto } from './dto/update-tach.dto';

/**
 * Service for managing task-related operations.
 */
@Injectable()
export class TachesService {
  constructor(
    @InjectModel(Tache.name) private readonly tacheModel: Model<Tache>,
  ) {}

  /**
   * Creates a new task.
   * @param createTacheDto - Data for creating a task.
   * @returns The created task.
   */
  async create(createTacheDto: CreateTacheDto): Promise<Tache> {
    if (!Types.ObjectId.isValid(createTacheDto.assigneA)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const newTache = new this.tacheModel(createTacheDto);
    return newTache.save();
  }

  /**
   * Retrieves all tasks.
   * @returns List of all tasks with populated user data.
   */
  async findAll(): Promise<Tache[]> {
    return this.tacheModel
      .find()
      .populate('assigneA', 'nom email role poste')
      .exec();
  }

  /**
   * Retrieves tasks assigned to a specific user.
   * @param userId - ID of the user.
   * @returns List of tasks assigned to the user.
   */
  async findByUser(userId: string): Promise<Tache[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    return this.tacheModel
      .find({ assigneA: userId })
      .populate('assigneA', 'nom email role poste')
      .exec();
  }

  /**
   * Retrieves a task by its ID.
   * @param id - Task ID.
   * @returns The task with the specified ID.
   */
  async findOne(id: string): Promise<Tache> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID format');
    }

    const tache = await this.tacheModel
      .findById(id)
      .populate('assigneA', 'nom email role poste')
      .exec();

    if (!tache) {
      throw new NotFoundException(`Tâche avec l'ID ${id} non trouvée`);
    }

    return tache;
  }

  /**
   * Updates a task.
   * @param id - Task ID.
   * @param updateTacheDto - Data for updating the task.
   * @returns The updated task.
   */
async update(id: string, updateTacheDto: UpdateTacheDto): Promise<Tache> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID format');
    }
    if (updateTacheDto.assigneA && !Types.ObjectId.isValid(updateTacheDto.assigneA)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const updated = await this.tacheModel
      .findByIdAndUpdate(id, updateTacheDto, { new: true })
      .populate('assigneA', 'nom email role poste')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Tâche avec l'ID ${id} non trouvée`);
    }
    return updated;
  }

  /**
   * Deletes a task.
   * @param id - Task ID.
   * @returns Success message.
   */
  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID format');
    }

    const result = await this.tacheModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Tâche avec l'ID ${id} non trouvée`);
    }

    return { message: `Tâche ${id} supprimée avec succès` };
  }
}