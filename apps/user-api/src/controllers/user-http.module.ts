import { Module } from '@nestjs/common'
import { AuthHttpModule } from './auth/auth-http.module'
import { FilesHttpModule } from './files/files-http.module'
import { UsersHttpModule } from './users/users-http.module'
import { VerificationsHttpModule } from './verifications/verifications-http.module'
import { NotificationsHttpModule } from './notifications/notifications-http.module'
import { ProjectHttpModule } from './project/project-http.module'
import { ProjectApplicationsHttpModule } from './project-applications/project-applications-http.module'
import { ProjectMemberHttpModule } from './project-member/project-member-http.module'
import { ProjectLikedHttpModule } from './project-liked/project-liked-http.module'
import { ProjectCommentsHttpModule } from './project-comments/project-comments-http.module'
import { ChallengeHttpModule } from './challenge/challenge-http.module'
import { ChallengeApplicationsHttpModule } from './challenge-applications/challenge-applications-http.module'
import { ChallengeMemberHttpModule } from './challenge-member/challenge-member-http.module'
import { ChallengeLikedHttpModule } from './challenge-liked/challenge-liked-http.module'
import { ChallengeCommentsHttpModule } from './challenge-comments/challenge-comments-http.module'
import { ChallengeBookmarkedHttpModule } from './challenge-bookmarked/challenge-bookmarked-http.module'
import { ChallengeVerificationsHttpModule } from './challenge-verifications/challenge-verifications-http.module'
import { MyPageHttpModule } from './mypage/mypage-http.module'

@Module({
  imports: [
    AuthHttpModule,
    VerificationsHttpModule,
    UsersHttpModule,
    MyPageHttpModule,
    NotificationsHttpModule,
    ChallengeHttpModule,
    ChallengeApplicationsHttpModule,
    ChallengeMemberHttpModule,
    ChallengeLikedHttpModule,
    ChallengeCommentsHttpModule,
    ProjectHttpModule,
    ProjectApplicationsHttpModule,
    ProjectMemberHttpModule,
    ProjectLikedHttpModule,
    ProjectCommentsHttpModule,
    ChallengeBookmarkedHttpModule,
    ChallengeVerificationsHttpModule,
    FilesHttpModule
  ],
  controllers: []
})
export class UserHttpModule {}
