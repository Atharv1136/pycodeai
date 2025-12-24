import pygame
import random

# Initialize Pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 600, 400
SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Snake Game")

# Colors
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLACK = (0, 0, 0)

# Game variables
GRID_SIZE = 20
GRID_WIDTH = WIDTH // GRID_SIZE
GRID_HEIGHT = HEIGHT // GRID_SIZE

# Snake class
class Snake:
    def __init__(self):
        self.head = [GRID_WIDTH // 2, GRID_HEIGHT // 2]
        self.body = [[GRID_WIDTH // 2, GRID_HEIGHT // 2], [GRID_WIDTH // 2 - 1, GRID_HEIGHT // 2], [GRID_WIDTH // 2 - 2, GRID_HEIGHT // 2]]
        self.direction = "RIGHT"
        self.grow = False

    def change_direction(self, new_direction):
        if new_direction == "UP" and self.direction != "DOWN":
            self.direction = "UP"
        elif new_direction == "DOWN" and self.direction != "UP":
            self.direction = "DOWN"
        elif new_direction == "LEFT" and self.direction != "RIGHT":
            self.direction = "LEFT"
        elif new_direction == "RIGHT" and self.direction != "LEFT":
            self.direction = "RIGHT"

    def move(self):
        if self.direction == "UP":
            self.head[1] -= 1
        elif self.direction == "DOWN":
            self.head[1] += 1
        elif self.direction == "LEFT":
            self.head[0] -= 1
        elif self.direction == "RIGHT":
            self.head[0] += 1
        
        # Insert new head to the body
        self.body.insert(0, list(self.head)) # Use list(self.head) to insert a copy

        # Remove tail unless growing
        if not self.grow:
            self.body.pop()
        else:
            self.grow = False

    def draw(self):
        for segment in self.body:
            pygame.draw.rect(SCREEN, GREEN, (segment[0] * GRID_SIZE, segment[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE))

    def check_collision(self):
        # Wall collision
        if self.head[0] < 0 or self.head[0] >= GRID_WIDTH or            self.head[1] < 0 or self.head[1] >= GRID_HEIGHT:
            return True
        
        # Self collision (check from second segment onwards)
        for segment in self.body[1:]:
            if self.head == segment:
                return True
        return False

# Food class
class Food:
    def __init__(self):
        self.position = [random.randrange(GRID_WIDTH), random.randrange(GRID_HEIGHT)]

    def spawn(self):
        self.position = [random.randrange(GRID_WIDTH), random.randrange(GRID_HEIGHT)]

    def draw(self):
        pygame.draw.rect(SCREEN, RED, (self.position[0] * GRID_SIZE, self.position[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE))

# Game loop
def game_loop():
    snake = Snake()
    food = Food()
    score = 0
    game_over = False

    clock = pygame.time.Clock()
    font = pygame.font.Font(None, 35)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if not game_over:
                    if event.key == pygame.K_UP: snake.change_direction("UP")
                    if event.key == pygame.K_DOWN: snake.change_direction("DOWN")
                    if event.key == pygame.K_LEFT: snake.change_direction("LEFT")
                    if event.key == pygame.K_RIGHT: snake.change_direction("RIGHT")
                else:
                    if event.key == pygame.K_r: # Restart game on 'R' key press
                        snake = Snake()
                        food = Food()
                        score = 0
                        game_over = False

        if not game_over:
            snake.move()

            # Check for collision after moving
            if snake.check_collision():
                game_over = True

            # Check for food collision
            if snake.head == food.position:
                score += 1
                snake.grow = True
                food.spawn()

        # Drawing
        SCREEN.fill(BLACK)
        snake.draw()
        food.draw()

        # Display score
        score_text = font.render(f"Score: {score}", True, WHITE)
        SCREEN.blit(score_text, (5, 5))

        # Game Over message
        if game_over:
            game_over_text = font.render("Game Over! Press 'R' to Restart", True, WHITE)
            text_rect = game_over_text.get_rect(center=(WIDTH // 2, HEIGHT // 2))
            SCREEN.blit(game_over_text, text_rect)

        pygame.display.flip()
        clock.tick(10) # Snake speed

    pygame.quit()

if __name__ == "__main__":
    game_loop()
