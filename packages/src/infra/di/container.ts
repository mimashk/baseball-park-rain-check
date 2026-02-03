import {
  createContainer,
  asValue,
  asClass,
  asFunction,
  InjectionMode,
  Lifetime,
  AwilixContainer,
} from "awilix";

import { PrismaClient } from "@prisma/client";
import { PrismaClientWrapper } from "../persistence/mysql/PrismaClientWrapper";
import { PrismaTransactionExecutor } from "../persistence/mysql/PrismaTransactionExecutor";
import { PrismaScheduledGameRepository } from "../persistence/mysql/repository/PrismaScheduledGameRepository";
import { PrismaBallParkDailyWeatherForecastRepository } from "../persistence/mysql/repository/PrismaBallParkDailyWeatherForecastRepository";

import { PrismaBallParkObservedHourlyWeatherRepository } from "../persistence/mysql/repository/PrismaBallParkObservedHourlyWeatherRepository";
import { PrismaPastGameRecordRepository } from "../persistence/mysql/repository/PrismaPastGameRecordRepository";
import { PrismaCancellationModelRepository } from "../persistence/mysql/repository/PrismaCancellationModelRepository";

import { TeamNameMapperImpl } from "../providers/mapper/TeamNameMapperImpl";
import { GameStatusMapperImpl } from "../providers/mapper/GameStatusMapperImpl";
import { GameStatusScraper } from "../providers/sportsNavi/GameStatusScraper";
import { GameStatusFormatter } from "../providers/sportsNavi/GameStatusFormatter";
import { GameStatusFetcherImpl } from "../providers/sportsNavi/GameStatusFetcherImpl";

import { ScheduledGameScraper } from "../providers/sportsNavi/ScheduledGameScraper";
import { ScheduledGameFormatter } from "../providers/sportsNavi/ScheduledGameFormatter";
import { ScheduledGameFetcherImpl } from "../providers/sportsNavi/ScheduledGameFetcherImpl";

import { PastGameScraper } from "../providers/pastGameRecord/PastGameScraper";
import { PastGameFormatter } from "../providers/pastGameRecord/PastGameFormatter";
import { PastGameRecordFetcherImpl } from "../providers/pastGameRecord/PastGameFetcher";

import { OpenMeteoClient } from "../providers/openmeteo/OpenMeteoClient";
import { OpenMeteoWeatherProvider } from "../providers/openmeteo/OpenMeteoWeatherProvider";

import {
  CloudSchedulerCheckpointAdapter,
  CloudSchedulerConfig,
} from "../scheduler/gcp/CloudCheckpointScheduler";

import { CancellationModelTrainerImpl } from "../statisticalModels/logisticRegression/CancellationModelTrainerImpl";
import { CancellationPredictorImpl } from "../statisticalModels/logisticRegression/CancellationPredictorImpl";
import { PredictCancellationUseCase } from "../../application/prediction/usecases/PredictCancellationUseCase";
import { RunGameCheckpointUseCase } from "../../application/scheduledGame/usecases/RunGameCheckpointUseCase";
import { RunTrainingPipelineUseCase } from "../../application/training/usecases/RunTrainingPipelineUseCase";
import { FetchPastGamesService } from "../../application/training/services/FetchPastGamesService";
import { FetchObservedHourlyWeatherService } from "../../application/training/services/FetchObservedHourlyWeatherService";
import { TrainModelService } from "../../application/training/services/TrainModelService";
import { UpdateGameStatusService } from "../../application/scheduledGame/services/UpdateGameStatusService";
import { PrismaBallParkHourlyWeatherForecastRepository } from "../persistence/mysql/repository/PrismaBallParkHourlyWeatherForecastRepository";
import { BallParkNameMapperImpl } from "../providers/mapper/BallParkNameMapperImpl";
import { ScheduleInitialGameCheckpointUseCase } from "../../application/scheduledGame/usecases/ScheduleInitialGameCheckpointUseCase";
import { RefreshScheduledGameAndDailyWeatherForecastUsecase } from "../../application/refresher/usecases/RefreshScheduledGameAndDailyWeatherForecastUsecase";
import { GetDashboardQuery } from "../../application/dashboard/queries/GetDashboardQuery";
import { GameCategoryMapperImpl } from "../providers/mapper/GameCategoryMapperImpl";

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
  ballParkNameMapper: BallParkNameMapperImpl;
  gameStatusMapper: GameStatusMapperImpl;
  gameCategoryMapper: GameCategoryMapperImpl;

  gameStatusScraper: GameStatusScraper;
  gameStatusFormatter: GameStatusFormatter;
  gameStatusFetcher: GameStatusFetcherImpl;

  scheduledGameScraper: ScheduledGameScraper;
  scheduledGameFormatter: ScheduledGameFormatter;
  scheduledGameFetcher: ScheduledGameFetcherImpl;

  pastGameScraper: PastGameScraper;
  pastGameFormatter: PastGameFormatter;
  pastGameFetcher: PastGameRecordFetcherImpl;

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
  scheduleInitialGameCheckpointUseCase: ScheduleInitialGameCheckpointUseCase;
  runGameCheckpointUseCase: RunGameCheckpointUseCase;
  predictCancellationUseCase: PredictCancellationUseCase;
  runTrainingPipelineUseCase: RunTrainingPipelineUseCase;
  refreshScheduledGameAndDailyWeatherForecastUsecase: RefreshScheduledGameAndDailyWeatherForecastUsecase;

  fetchPastGamesService: FetchPastGamesService;
  fetchObservedHourlyWeatherService: FetchObservedHourlyWeatherService;
  trainModelService: TrainModelService;
  updateGameStatusService: UpdateGameStatusService;

  getDashboardQuery: GetDashboardQuery;
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
      injectionMode: InjectionMode.CLASSIC, // 追加
    }),
    ballParkNameMapper: asClass(BallParkNameMapperImpl, {
      lifetime: Lifetime.SINGLETON,
      injectionMode: InjectionMode.CLASSIC,
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
        new GameStatusFetcherImpl(gameStatusScraper, gameStatusFormatter),
      { lifetime: Lifetime.SINGLETON }
    ),

    scheduledGameScraper: asClass(ScheduledGameScraper, {
      lifetime: Lifetime.SINGLETON,
    }),
    scheduledGameFormatter: asFunction(
      ({
        teamNameMapper,
        ballParkNameMapper,
        gameCategoryMapper,
      }: InfraCradle) =>
        new ScheduledGameFormatter(
          teamNameMapper,
          ballParkNameMapper,
          gameCategoryMapper
        ),
      { lifetime: Lifetime.SINGLETON }
    ),
    scheduledGameFetcher: asFunction(
      ({ scheduledGameScraper, scheduledGameFormatter }: InfraCradle) =>
        new ScheduledGameFetcherImpl(
          scheduledGameScraper,
          scheduledGameFormatter
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    pastGameScraper: asClass(PastGameScraper, {
      lifetime: Lifetime.SINGLETON,
    }),
    pastGameFormatter: asFunction(
      ({ teamNameMapper, ballParkNameMapper }: InfraCradle) =>
        new PastGameFormatter(teamNameMapper, ballParkNameMapper),
      { lifetime: Lifetime.SINGLETON }
    ),
    pastGameFetcher: asFunction(
      ({ pastGameScraper, pastGameFormatter }: InfraCradle) =>
        new PastGameRecordFetcherImpl(pastGameScraper, pastGameFormatter),
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
    refreshScheduledGameAndDailyWeatherForecastUsecase: asFunction(
      ({
        scheduledGameFetcher,
        dailyWeatherForecastProvider,
        scheduledGameRepository,
        ballParkDailyWeatherForecastRepository,
        transactionExecutor,
      }: InfraCradle) =>
        new RefreshScheduledGameAndDailyWeatherForecastUsecase(
          scheduledGameFetcher,
          dailyWeatherForecastProvider,
          scheduledGameRepository,
          ballParkDailyWeatherForecastRepository,
          transactionExecutor
        ),
      { lifetime: Lifetime.SINGLETON }
    ),

    updateGameStatusService: asFunction(
      ({ scheduledGameRepository, gameStatusFetcher }: InfraCradle) =>
        new UpdateGameStatusService(scheduledGameRepository, gameStatusFetcher),
      { lifetime: Lifetime.SINGLETON }
    ),

    scheduleInitialGameCheckpointUseCase: asFunction(
      ({ checkpointScheduler, scheduledGameRepository }: InfraCradle) =>
        new ScheduleInitialGameCheckpointUseCase(
          checkpointScheduler,
          scheduledGameRepository
        ),
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
        cancellationModelRepository,
        cancellationPredictor,
        hourlyWeatherForecastProvider,
        ballParkHourlyWeatherForecastRepository,
        transactionExecutor,
      }: InfraCradle) =>
        new PredictCancellationUseCase(
          scheduledGameRepository,
          cancellationModelRepository,
          cancellationPredictor,
          hourlyWeatherForecastProvider,
          ballParkHourlyWeatherForecastRepository,
          transactionExecutor
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

    getDashboardQuery: asClass(GetDashboardQuery, {
      lifetime: Lifetime.SINGLETON,
    }),
  });

  return container;
};
