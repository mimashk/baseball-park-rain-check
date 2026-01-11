import {
  createContainer,
  asValue,
  asClass,
  asFunction,
  InjectionMode,
  Lifetime,
  AwilixContainer,
} from "awilix";

import { PrismaClient } from "../persistence/mysql/prisma/generate/client";
import { PrismaClientWrapper } from "../persistence/mysql/PrismaClientWrapper";
import { PrismaTransactionExecutor } from "../persistence/mysql/PrismaTransactionExecutor";
import { PrismaScheduledGameRepository } from "../persistence/mysql/repository/PrismaScheduledGameRepository";
import { PrismaBallParkDailyWeatherForecastRepository } from "../persistence/mysql/repository/PrismaBallParkDailyWeatherForecastRepository";

import { PrismaBallParkObservedHourlyWeatherRepository } from "../persistence/mysql/repository/PrismaBallParkObservedHourlyWeatherRepository";
import { PrismaPastGameRecordRepository } from "../persistence/mysql/repository/PrismaPastGameRecordRepository";
import { PrismaCancellationModelRepository } from "../persistence/mysql/repository/PrismaCancellationModelRepository";

import { TeamNameMapperImpl } from "../providers/shared/TeamNameMapperImpl";
import { GameStatusMapperImpl } from "../providers/gameStatus/GameStatusMapperImpl";
import { GameStatusScraper } from "../providers/gameStatus/GameStatusScraper";
import { GameStatusFormatter } from "../providers/gameStatus/GameStatusFormatter";
import { HanshinGameStatusFetcher } from "../providers/gameStatus/HanshinGameStatusFetcher";

import { HanshinScheduledGameScraper } from "../providers/scheduledGame/HanshinScheduledGameScraper";
import { HanshinScheduledGameFormatter } from "../providers/scheduledGame/HanshinScheduledGameFormatter";
import { HanshinScheduledGameFetcher } from "../providers/scheduledGame/HanshinScheduledGameFetcher";

import { HanshinPastGameScraper } from "../providers/pastGameRecord/HanshinPastGameScraper";
import { HanshinPastGameFormatter } from "../providers/pastGameRecord/HanshinPastGameFormatter";
import { HanshinPastGameFetcher } from "../providers/pastGameRecord/HanshinPastGameFetcher";

import { OpenMeteoClient } from "../providers/openmeteo/OpenMeteoClient";
import { OpenMeteoWeatherProvider } from "../providers/openmeteo/OpenMeteoWeatherProvider";

import {
  CloudSchedulerCheckpointAdapter,
  CloudSchedulerConfig,
} from "../scheduler/gcp/CloudCheckpointScheduler";

import { CancellationModelTrainerImpl } from "../statisticalModels/logisticRegression/CancellationModelTrainerImpl";
import { CancellationPredictorImpl } from "../statisticalModels/logisticRegression/CancellationPredictorImpl";
import { RefreshHourlyWeatherForecastsService } from "../../application/weatherForecast/services/RefreshHourlyWeatherForecastsService";
import { PredictCancellationUseCase } from "../../application/prediction/usecases/PredictCancellationUseCase";
import { RefreshDailyWeatherForecastsUsecase } from "../../application/weatherForecast/usecases/RefreshDailyWeatherForecastsUsecase";
import { RefreshScheduledGameUsecase } from "../../application/scheduledGame/usecases/RefreshScheduledGameUsecase";
import { RunGameCheckpointUseCase } from "../../application/scheduledGame/usecases/RunGameCheckpointUseCase";
import { RunTrainingPipelineUseCase } from "../../application/training/usecases/RunTrainingPipelineUseCase";
import { FetchPastGamesService } from "../../application/training/services/FetchPastGamesService";
import { FetchObservedHourlyWeatherService } from "../../application/training/services/FetchObservedHourlyWeatherService";
import { TrainModelService } from "../../application/training/services/TrainModelService";
import { UpdateGameStatusService } from "../../application/scheduledGame/services/UpdateGameStatusService";
import { PrismaBallParkHourlyWeatherForecastRepository } from "../persistence/mysql/repository/PrismaBallParkHourlyWeatherForecastRepository";

const defaultCloudSchedulerConfig: CloudSchedulerConfig = {
  projectId: "baseball-park-rain-check",
  location: "asia-northeast1",
  timeZone: "Asia/Tokyo",
  baseUrl: "https://asia-northeast1-baseball-park-rain-check.run.app",
  invokerServiceAccountEmail:
    "scheduler-invoker@baseball-park-rain-check.iam.gserviceaccount.com",
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
};

export type InfraCradle = {
  prisma: PrismaClient;
  cloudScheduler: CloudSchedulerConfig;

  transactionExecutor: PrismaTransactionExecutor;

  teamNameMapper: TeamNameMapperImpl;
  gameStatusMapper: GameStatusMapperImpl;

  gameStatusScraper: GameStatusScraper;
  gameStatusFormatter: GameStatusFormatter;
  gameStatusFetcher: HanshinGameStatusFetcher;

  scheduledGameScraper: HanshinScheduledGameScraper;
  scheduledGameFormatter: HanshinScheduledGameFormatter;
  scheduledGameFetcher: HanshinScheduledGameFetcher;

  pastGameScraper: HanshinPastGameScraper;
  pastGameFormatter: HanshinPastGameFormatter;
  pastGameFetcher: HanshinPastGameFetcher;

  openMeteoClient: OpenMeteoClient;
  weatherProvider: OpenMeteoWeatherProvider;

  dailyWeatherForecastProvider: OpenMeteoWeatherProvider;
  hourlyWeatherForecastProvider: OpenMeteoWeatherProvider;
  observedHourlyWeatherProvider: OpenMeteoWeatherProvider;

  scheduledGameRepository: PrismaScheduledGameRepository;
  ballParkDailyWeatherForecastRepository: PrismaBallParkDailyWeatherForecastRepository;
  ballParkHourlyWeatherForecastRepository: PrismaBallParkHourlyWeatherForecastRepository;
  ballParkObservedHourlyWeatherRepository: PrismaBallParkObservedHourlyWeatherRepository;
  pastGameRecordRepository: PrismaPastGameRecordRepository;
  cancellationModelRepository: PrismaCancellationModelRepository;

  cancellationModelTrainer: CancellationModelTrainerImpl;
  cancellationPredictor: CancellationPredictorImpl;

  checkpointScheduler: CloudSchedulerCheckpointAdapter;

  // application services / usecases
  refreshHourlyWeatherForecastsService: RefreshHourlyWeatherForecastsService;
  refreshDailyWeatherForecastsUsecase: RefreshDailyWeatherForecastsUsecase;
  refreshScheduledGameUsecase: RefreshScheduledGameUsecase;
  runGameCheckpointUseCase: RunGameCheckpointUseCase;
  predictCancellationUseCase: PredictCancellationUseCase;
  runTrainingPipelineUseCase: RunTrainingPipelineUseCase;

  fetchPastGamesService: FetchPastGamesService;
  fetchObservedHourlyWeatherService: FetchObservedHourlyWeatherService;
  trainModelService: TrainModelService;
  updateGameStatusService: UpdateGameStatusService;
};

export const createInfraContainer = (): AwilixContainer<InfraCradle> => {
  const prisma = PrismaClientWrapper.getInstance();
  const mergedConfig: CloudSchedulerConfig = {
    ...defaultCloudSchedulerConfig,
  };

  const container = createContainer<InfraCradle>({
    injectionMode: InjectionMode.PROXY,
  });

  container.register({
    prisma: asValue(prisma),
    cloudScheduler: asValue(mergedConfig),

    transactionExecutor: asClass(PrismaTransactionExecutor, {
      lifetime: Lifetime.SINGLETON,
    }),

    teamNameMapper: asClass(TeamNameMapperImpl, {
      lifetime: Lifetime.SINGLETON,
    }),
    gameStatusMapper: asClass(GameStatusMapperImpl, {
      lifetime: Lifetime.SINGLETON,
    }),

    gameStatusScraper: asClass(GameStatusScraper, {
      lifetime: Lifetime.SINGLETON,
    }),
    gameStatusFormatter: asFunction(
      ({ teamNameMapper, gameStatusMapper }: InfraCradle) =>
        new GameStatusFormatter(teamNameMapper, gameStatusMapper),
      { lifetime: Lifetime.SINGLETON }
    ),
    gameStatusFetcher: asFunction(
      ({ gameStatusScraper, gameStatusFormatter }: InfraCradle) =>
        new HanshinGameStatusFetcher(gameStatusScraper, gameStatusFormatter),
      { lifetime: Lifetime.SINGLETON }
    ),

    scheduledGameScraper: asClass(HanshinScheduledGameScraper, {
      lifetime: Lifetime.SINGLETON,
    }),
    scheduledGameFormatter: asFunction(
      ({ teamNameMapper }: InfraCradle) =>
        new HanshinScheduledGameFormatter(teamNameMapper),
      { lifetime: Lifetime.SINGLETON }
    ),
    scheduledGameFetcher: asFunction(
      ({ scheduledGameScraper, scheduledGameFormatter }: InfraCradle) =>
        new HanshinScheduledGameFetcher(
          scheduledGameScraper,
          scheduledGameFormatter
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    pastGameScraper: asClass(HanshinPastGameScraper, {
      lifetime: Lifetime.SINGLETON,
    }),
    pastGameFormatter: asFunction(
      ({ teamNameMapper }: InfraCradle) =>
        new HanshinPastGameFormatter(teamNameMapper),
      { lifetime: Lifetime.SINGLETON }
    ),
    pastGameFetcher: asFunction(
      ({ pastGameScraper, pastGameFormatter }: InfraCradle) =>
        new HanshinPastGameFetcher(pastGameScraper, pastGameFormatter),
      { lifetime: Lifetime.SINGLETON }
    ),

    openMeteoClient: asClass(OpenMeteoClient, { lifetime: Lifetime.SINGLETON }),
    weatherProvider: asFunction(
      ({ openMeteoClient }: InfraCradle) =>
        new OpenMeteoWeatherProvider(openMeteoClient),
      { lifetime: Lifetime.SINGLETON }
    ),
    dailyWeatherForecastProvider: asFunction(
      ({ weatherProvider }: InfraCradle) => weatherProvider,
      { lifetime: Lifetime.SINGLETON }
    ),
    hourlyWeatherForecastProvider: asFunction(
      ({ weatherProvider }: InfraCradle) => weatherProvider,
      { lifetime: Lifetime.SINGLETON }
    ),
    observedHourlyWeatherProvider: asFunction(
      ({ weatherProvider }: InfraCradle) => weatherProvider,
      { lifetime: Lifetime.SINGLETON }
    ),

    scheduledGameRepository: asFunction(
      ({ prisma }: InfraCradle) => new PrismaScheduledGameRepository(prisma),
      { lifetime: Lifetime.SINGLETON }
    ),
    ballParkDailyWeatherForecastRepository: asFunction(
      ({ prisma }: InfraCradle) =>
        new PrismaBallParkDailyWeatherForecastRepository(prisma),
      { lifetime: Lifetime.SINGLETON }
    ),
    ballParkHourlyWeatherForecastRepository: asFunction(
      ({ prisma }: InfraCradle) =>
        new PrismaBallParkHourlyWeatherForecastRepository(prisma),
      { lifetime: Lifetime.SINGLETON }
    ),
    ballParkObservedHourlyWeatherRepository: asFunction(
      ({ prisma }: InfraCradle) =>
        new PrismaBallParkObservedHourlyWeatherRepository(prisma),
      { lifetime: Lifetime.SINGLETON }
    ),
    pastGameRecordRepository: asFunction(
      ({ prisma }: InfraCradle) => new PrismaPastGameRecordRepository(prisma),
      { lifetime: Lifetime.SINGLETON }
    ),
    cancellationModelRepository: asFunction(
      ({ prisma }: InfraCradle) =>
        new PrismaCancellationModelRepository(prisma),
      { lifetime: Lifetime.SINGLETON }
    ),

    cancellationModelTrainer: asClass(CancellationModelTrainerImpl, {
      lifetime: Lifetime.SINGLETON,
    }),
    cancellationPredictor: asClass(CancellationPredictorImpl, {
      lifetime: Lifetime.SINGLETON,
    }),

    checkpointScheduler: asFunction(
      ({ cloudScheduler }: InfraCradle) =>
        new CloudSchedulerCheckpointAdapter(cloudScheduler),
      { lifetime: Lifetime.SINGLETON }
    ),

    // application services / usecases
    // register に追記（既存 register の末尾あたりに追加）
    refreshHourlyWeatherForecastsService: asFunction(
      ({
        hourlyWeatherForecastProvider,
        ballParkHourlyWeatherForecastRepository,
        transactionExecutor,
      }: InfraCradle) =>
        new RefreshHourlyWeatherForecastsService(
          hourlyWeatherForecastProvider,
          ballParkHourlyWeatherForecastRepository,
          transactionExecutor
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    refreshDailyWeatherForecastsUsecase: asFunction(
      ({
        dailyWeatherForecastProvider,
        ballParkDailyWeatherForecastRepository,
        transactionExecutor,
      }: InfraCradle) =>
        new RefreshDailyWeatherForecastsUsecase(
          dailyWeatherForecastProvider,
          ballParkDailyWeatherForecastRepository,
          transactionExecutor
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    refreshScheduledGameUsecase: asFunction(
      ({
        scheduledGameFetcher,
        scheduledGameRepository,
        transactionExecutor,
      }: InfraCradle) =>
        new RefreshScheduledGameUsecase(
          scheduledGameFetcher,
          scheduledGameRepository,
          transactionExecutor
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    updateGameStatusService: asFunction(
      ({ scheduledGameRepository, gameStatusFetcher }: InfraCradle) =>
        new UpdateGameStatusService(scheduledGameRepository, gameStatusFetcher),
      { lifetime: Lifetime.SINGLETON }
    ),

    runGameCheckpointUseCase: asFunction(
      ({
        updateGameStatusService,
        checkpointScheduler,
        scheduledGameRepository,
      }: InfraCradle) =>
        new RunGameCheckpointUseCase(
          updateGameStatusService,
          checkpointScheduler,
          scheduledGameRepository
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    predictCancellationUseCase: asFunction(
      ({
        scheduledGameRepository,
        refreshHourlyWeatherForecastsService,
        cancellationModelRepository,
        cancellationPredictor,
      }: InfraCradle) =>
        new PredictCancellationUseCase(
          scheduledGameRepository,
          refreshHourlyWeatherForecastsService,
          cancellationModelRepository,
          cancellationPredictor
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    fetchPastGamesService: asFunction(
      ({ pastGameFetcher }: InfraCradle) =>
        new FetchPastGamesService(pastGameFetcher),
      { lifetime: Lifetime.SINGLETON }
    ),

    fetchObservedHourlyWeatherService: asFunction(
      ({ observedHourlyWeatherProvider }: InfraCradle) =>
        new FetchObservedHourlyWeatherService(observedHourlyWeatherProvider),
      { lifetime: Lifetime.SINGLETON }
    ),

    trainModelService: asFunction(
      ({ cancellationModelTrainer }: InfraCradle) =>
        new TrainModelService(cancellationModelTrainer),
      { lifetime: Lifetime.SINGLETON }
    ),

    runTrainingPipelineUseCase: asFunction(
      ({
        fetchPastGamesService,
        fetchObservedHourlyWeatherService,
        trainModelService,
        pastGameRecordRepository,
        ballParkObservedHourlyWeatherRepository,
        cancellationModelRepository,
        transactionExecutor,
      }: InfraCradle) =>
        new RunTrainingPipelineUseCase(
          fetchPastGamesService,
          fetchObservedHourlyWeatherService,
          trainModelService,
          pastGameRecordRepository,
          ballParkObservedHourlyWeatherRepository,
          cancellationModelRepository,
          transactionExecutor
        ),
      { lifetime: Lifetime.SINGLETON }
    ),
  });

  return container;
};
