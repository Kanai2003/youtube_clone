# Youtube-Twitter clone backend 

## Target Data models to build [ER_Diagram](./ER_Diagram.png)

## Documentation: [Postman API Documentation](https://documenter.getpostman.com/view/27116622/2s9YynkPkS) 


## Table of Contents
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Description

This is a comprehensive backend project for a YouTube clone with additional Twite features. It is built using JavaScript, Node.js, and various popular libraries and frameworks.

## Features

#### User Authentication
- Secure user authentication using JWT (JSON Web Tokens).

### YouTube-like Features

#### Video Management
- **Video Upload:** Allows users to upload videos to the platform.
- **Cloudinary Integration:** Integrates with Cloudinary for efficient storage of video and image assets.
- **User Authorization:** Implements user roles and permissions for managing video content.
- **Pagination:** Utilizes mongoose-aggregate-paginate-v2 for seamless pagination of video content.

#### Social Interaction
- **Channel Subscription:** Users can subscribe to their favorite channels to receive updates on new videos.
- **Like and Comment:** Users can express their appreciation by liking videos and leaving comments.
- **Playlist Management:** Allows users to create and manage playlists for organizing their favorite videos.

#### Dashboard
- **User Dashboard:** Provides a personalized dashboard where users can view statistics, such as video views, likes, and subscriber count.

### Twitter-like Features

#### Twite Integration
- **Tweet Creation:** Users can compose and post tweets to share their thoughts or updates.
- **Tweet Editing:** Provides the ability for users to edit their tweets after posting.
- **Tweet Deletion:** Allows users to remove tweets they no longer wish to keep.

These features collectively create a comprehensive video-sharing platform with functionalities similar to YouTube, including video uploads, channel subscriptions, likes, comments, playlists, and a user dashboard. Additionally, the integration of Twitter-like features allows users to share and interact with short messages in a familiar social media style.


## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kanai2003/youtube_clone
2. **Install dependencies:**
    ```bash
    npm install
3.  **Set up environment variables:**
Create a .env file in the root directory and provide the necessary variables 
    ```bash
    PORT=
    MONDODB_URI=
    CORS_ORIGIN=
    ACCESS_TOKEN_SECRET=
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=
    REFRESH_TOKEN_EXPIRY=10d
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
4.  **Run the development server:**
    ```bash
    npm run dev
Access the API endpoints locally at `http://localhost:your_port`

## Dependencies

- [bcrypt](https://www.npmjs.com/package/bcrypt): Password hashing library.
- [cloudinary](https://www.npmjs.com/package/cloudinary): Cloudinary SDK for media storage.
- [cookie-parser](https://www.npmjs.com/package/cookie-parser): Parse and set cookies in requests.
- [cors](https://www.npmjs.com/package/cors): Enable Cross-Origin Resource Sharing.
- [dotenv](https://www.npmjs.com/package/dotenv): Load environment variables from a file.
- [express](https://www.npmjs.com/package/express): Web application framework.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): Generate and verify JSON web tokens.
- [mongoose](https://www.npmjs.com/package/mongoose): MongoDB object modeling.
- [mongoose-aggregate-paginate-v2](https://www.npmjs.com/package/mongoose-aggregate-paginate-v2): Paginate MongoDB aggregation results.
- [multer](https://www.npmjs.com/package/multer): Middleware for handling multipart/form-data.

## Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[View the MIT License](LICENSE.)**


## Author

**[Kanailal Manna(Kanai2003)](https://github.com/kanai2003)**
All thanks to **[Mr. Hitesh Choudhary](https://github.com/hiteshchoudhary)**